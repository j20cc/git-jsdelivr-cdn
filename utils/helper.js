function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function generateRandomNumber() {
  const min = 10000; // 1 万
  const max = 90000; // 9 万 9
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRawUrl(owner, repo, branch, path) {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
}

function getCdnUrl(owner, repo, branch, path) {
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`
}

export {
  getCurrentDate,
  generateRandomNumber,
  getRawUrl,
  getCdnUrl
}