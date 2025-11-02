document.getElementById("downloadBtn").addEventListener("click", function () {
  const url = document.getElementById("videoUrl").value.trim();
  const status = document.getElementById("status");
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");

  if (!url) {
    status.innerText = "⚠️ Veuillez coller le lien de la vidéo.";
    return;
  }

  status.innerText = "⏳ Téléchargement en cours...";
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";

  // Extraire l'ID de la vidéo YouTube
  const videoId = url.split("v=")[1]?.substring(0, 11);
  if (!videoId) {
    status.innerText = "❌ Lien YouTube invalide.";
    return;
  }

  // Étape 1: lancer le téléchargement
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      try {
        const response = JSON.parse(this.responseText);
        const downloadId = response.id || null; // identifiant de progression

        if (downloadId) {
          status.innerText = "🔄 Téléchargement lancé, veuillez patienter...";
          checkProgress(downloadId); // lancer la vérification de la progression
        } else if (response.link) {
          status.innerHTML = `✅ <a href="${response.link}" target="_blank">Cliquez ici pour télécharger</a>`;
          progressBar.style.width = "100%";
        } else {
          status.innerText = "⚠️ Impossible de récupérer le lien.";
        }
      } catch (e) {
        status.innerText = "Erreur lors du téléchargement.";
      }
    }
  });

  xhr.open(
    "GET",
    `https://youtube-mp4-mp3-downloader.p.rapidapi.com/api/v1/download?format=720&id=${videoId}&audioQuality=128&addInfo=false`
  );
  xhr.setRequestHeader(
    "x-rapidapi-key",
    "c79e4234a8msh95ad14a3e417e23p1bbdc1jsnbbf3c976afaf"
  );
  xhr.setRequestHeader(
    "x-rapidapi-host",
    "youtube-mp4-mp3-downloader.p.rapidapi.com"
  );

  xhr.send(null);

  // Étape 2: suivi de progression
  function checkProgress(downloadId) {
    const progressXhr = new XMLHttpRequest();
    progressXhr.withCredentials = true;

    progressXhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        try {
          const data = JSON.parse(this.responseText);
          if (data.progress) {
            const percent = Math.round(data.progress);
            progressBar.style.width = percent + "%";
            status.innerText = `⏳ Progression : ${percent}%`;

            if (percent < 100) {
              setTimeout(() => checkProgress(downloadId), 2000);
            } else if (data.link) {
              status.innerHTML = `✅ <a href="${data.link}" target="_blank">Télécharger la vidéo</a>`;
            }
          } else {
            status.innerText = "En attente de progression...";
            setTimeout(() => checkProgress(downloadId), 2000);
          }
        } catch (err) {
          console.error(err);
          status.innerText = "Erreur pendant la progression.";
        }
      }
    });

    progressXhr.open(
      "GET",
      `https://youtube-mp4-mp3-downloader.p.rapidapi.com/api/v1/progress?id=${downloadId}`
    );
    progressXhr.setRequestHeader(
      "x-rapidapi-key",
      "c79e4234a8msh95ad14a3e417e23p1bbdc1jsnbbf3c976afaf" );
    progressXhr.setRequestHeader(
      "x-rapidapi-host",
      "youtube-mp4-mp3-downloader.p.rapidapi.com"
    );

    progressXhr.send(null);
  }
});
