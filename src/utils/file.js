import SparkMD5 from 'spark-md5';

/**
 * 根据文件大小动态设置分片大小
 * @param {number} fileSize - 文件大小，单位为字节
 * @returns {number} - 分片大小，单位为字节
 */
function getChunkSize(fileSize) {
    const MB = 1024 * 1024;
    const GB = 1024 * MB;

    if (fileSize < 5 * MB) {
        return 1 * MB; // 1MB
    } else if (fileSize < 50 * MB) {
        return 2 * MB; // 2MB
    } else if (fileSize < 100 * MB) {
        return 4 * MB; // 4MB
    } else if (fileSize < 1 * GB) {
        return 8 * MB; // 8MB
    } else if (fileSize < 2 * GB) {
        return 16 * MB; // 16MB
    } else {
        return 32 * MB; // 32MB
    }
}

/**
 * 计算文件Md5
 * 将文件分片逐步计算最终合并得出整个文件md5, 提升计算速度
 * @param {File} file - 要计算 MD5 的文件对象
 * @param {function} onProgress - 进度回调函数
 * @returns {Promise<string>} - 返回文件的 MD5 值
 */
export default function computeFileMD5(file, onProgress) { 
   return new Promise((resolve, reject) => {
      let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      let chunkSize = getChunkSize(file.size);  // 动态设置分片大小
      let chunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;
      let spark = new SparkMD5.ArrayBuffer();
      let fileReader = new FileReader();
      
      fileReader.onload = function (e) {
        console.log('读取分片', currentChunk + 1, '/', chunks);
        spark.append(e.target.result);
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          console.log('MD5计算完成');
          let md5 = spark.end();
          spark.destroy();
          resolve(md5);
        }

        if (onProgress) {
          onProgress(Math.round((currentChunk / chunks) * 100));
        }
      };
      
      fileReader.onerror = function (e) {
        console.error('文件读取错误:', e);
        reject(e);
      };
      
      function loadNext() {
        let start = currentChunk * chunkSize;
        let end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      }

      loadNext();
   }) 
}