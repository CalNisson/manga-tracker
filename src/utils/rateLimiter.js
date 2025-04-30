const queue = [];
let isProcessing = false;
const delay = 400;

export function rateLimitedFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    queue.push({ url, options, resolve, reject });
    if (!isProcessing) processQueue();
  });
}

async function processQueue() {
  isProcessing = true;
  while (queue.length > 0) {
    const { url, options, resolve, reject } = queue.shift();
    try {
      const response = await fetch(url, options);
      resolve(response);
    } catch (err) {
      reject(err);
    }
    await new Promise(r => setTimeout(r, delay));
  }
  isProcessing = false;
}
