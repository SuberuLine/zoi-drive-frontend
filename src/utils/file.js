import SparkMD5 from "spark-md5";
import instance from "@/api";

/**
 * 根据文件大小动态设置分片大小
 * @param {number} fileSize - 文件大小，单位为字节
 * @returns {number} - 分片大小，单位为字节
 */
export function getChunkSize(fileSize) {
    const MB = 1024 * 1024;
    const GB = 1024 * MB;
    const MIN_CHUNK_SIZE = 5 * MB; // 最小分片大小为 5MB

    if (fileSize < 50 * MB) {
        return MIN_CHUNK_SIZE; // 5MB
    } else if (fileSize < 100 * MB) {
        return 8 * MB; // 8MB
    } else if (fileSize < 1 * GB) {
        return 16 * MB; // 16MB
    } else if (fileSize < 2 * GB) {
        return 32 * MB; // 32MB
    } else {
        return 64 * MB; // 64MB
    }
}

/**
 * 动态确定最大并发数
 * @param {number} fileSize - 文件大小（字节）
 * @returns {number} - 最大并发数
 */
function getMaxConcurrent(fileSize) {
  const MB = 1024 * 1024;
  const GB = 1024 * MB;
  
  if (fileSize < 20 * MB) {
      return 2;
  } else if (fileSize < 100 * MB) {
      return 3;
  } else if (fileSize < 1 * GB) {
      return 5;
  } else if (fileSize < 5 * GB) {
      return 10;
  } else {
      return 20
  }
}

/**
 * 计算文件Md5
 * 将文件分片逐步计算最终合并得出整个文件md5, 提升计算速度
 * @param {File} file - 要计算 MD5 的文件对象
 * @param {function} onProgress - 进度回调函数
 * @param {object} cancelToken - 取消标记
 * @returns {Promise<string>} - 返回文件的 MD5 值
 */
export function computeFileMD5(file, onProgress, cancelToken) {
    return new Promise((resolve, reject) => {
        let blobSlice =
            File.prototype.slice ||
            File.prototype.mozSlice ||
            File.prototype.webkitSlice;
        let chunkSize = getChunkSize(file.size); // 动态设置分片大小
        let chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;
        let spark = new SparkMD5.ArrayBuffer();
        let fileReader = new FileReader();

        fileReader.onload = function (e) {
            if (cancelToken.isCanceled) {
                reject(new Error("canceled"));
                return;
            }
            console.log(
                "读取分片",
                currentChunk + 1,
                "/",
                chunks,
                "Size:",
                e.target.result.byteLength
            );
            spark.append(e.target.result);
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                let md5 = spark.end();
                console.log("MD5计算完成:", md5);
                spark.destroy();
                resolve(md5);  // 确保这里返回计算得到的 MD5 值
            }

            if (onProgress) {
                onProgress(Math.round((currentChunk / chunks) * 100));
            }
        };

        fileReader.onerror = function (e) {
            console.error("文件读取错误:", e);
            reject(e);
        };

        function loadNext() {
            if (cancelToken.isCanceled) {
                reject(new Error("canceled"));
                return;
            }
            let start = currentChunk * chunkSize;
            let end =
                start + chunkSize >= file.size ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }

        loadNext();
    });
}

/**
 * 分片上传文件
 * @param {File} file - 要上传的文件对象
 * @param {string} md5 - 文件的MD5值
 * @param {function} onProgress - 进度回调函数
 * @param {object} cancelToken - 取消标记
 * @returns {Promise<void>}
 */
export async function uploadChunk(file, md5, onProgress, cancelToken) {
    const chunkSize = getChunkSize(file.size);
    const chunks = Math.ceil(file.size / chunkSize);
    const maxConcurrent = getMaxConcurrent(file.size); // 最大并发上传数

    let startTime = Date.now();
    let uploadedSize = 0;

    const updateProgressWithSpeed = (chunkSize) => {
        uploadedSize += chunkSize;
        const elapsedTime = (Date.now() - startTime) / 1000; // 转换为秒
        const speedBps = uploadedSize / elapsedTime; // 字节/秒
        const progress = Math.round((uploadedSize / file.size) * 100);
        
        if (onProgress) {
            onProgress(progress, speedBps);
        }
    };

    // 如果文件大小小于最小分片大小，直接上传整个文件
    if (file.size <= chunkSize) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("hash", md5);
        formData.append("chunk", "0");
        formData.append("chunks", "1");
        formData.append("folderId", 10)

        await instance.post("/file/upload/chunk", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 0,
        });

        updateProgressWithSpeed(file.size);
    } else {
        // 分片上传
        const uploadChunk = async (i) => {
            if (cancelToken.isCanceled) {
                throw new Error("canceled");
            }

            const start = i * chunkSize;
            const end = Math.min(file.size, start + chunkSize);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append("file", chunk, file.name);
            formData.append("hash", md5);
            formData.append("chunk", i.toString());
            formData.append("chunks", chunks.toString());

            await instance.post("/file/upload/chunk", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 0,
            });

            updateProgressWithSpeed(chunk.size);
        };

        // 并行上传分片
        for (let i = 0; i < chunks; i += maxConcurrent) {
            const uploadPromises = [];
            for (let j = 0; j < maxConcurrent && i + j < chunks; j++) {
                uploadPromises.push(uploadChunk(i + j));
            }
            await Promise.all(uploadPromises);
        }
    }

    if (cancelToken.isCanceled) {
        throw new Error("canceled");
    }
}
