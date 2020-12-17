function getError(action: string, option: UploadOption, xhr: XMLHttpRequest) {
  let msg;
  if (xhr.response) {
    msg = `${xhr.response.error || xhr.response}`;
  } else if (xhr.responseText) {
    msg = `${xhr.responseText}`;
  } else {
    msg = `fail to post ${action} ${xhr.status}`;
  }

  const err = new Error(msg);
  // @ts-ignore
  err.status = xhr.status;
  // @ts-ignore
  err.method = "post";
  // @ts-ignore
  err.url = action;
  return err;
}

function getBody(xhr: XMLHttpRequest) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export interface UploadOption {
  headers?: { [key: string]: string };
  withCredentials?: boolean;
  file: File;
  data?: any;
  filename: string;
  action: string;
  onProgress?: (e: ProgressEvent) => void;
  onSuccess: (res: UploadResponse) => void;
  onError?: (err: Error | ProgressEvent) => any;
}

export interface UploadResponse {
  extname: string;
  filename: string;
  key: string;
  md5: string;
  size: number;
  url: string;
}

export function upload(option: UploadOption) {
  if (typeof XMLHttpRequest === "undefined") {
    return;
  }

  const xhr = new XMLHttpRequest();
  const action = option.action;

  if (xhr.upload) {
    xhr.upload.onprogress = function progress(e) {
      if (e.total > 0) {
        // @ts-ignore
        e.percent = (e.loaded / e.total) * 100;
      }
      if (option.onProgress) {
        option.onProgress(e);
      }
    };
  }

  const formData = new FormData();

  if (option.data) {
    Object.keys(option.data).forEach(key => {
      formData.append(key, option.data[key]);
    });
  }

  formData.append(option.filename, option.file, option.file.name);

  xhr.onerror = function error(e) {
    if (option.onError) {
      option.onError(e);
    }
  };

  xhr.onload = function onload() {
    if (xhr.status < 200 || xhr.status >= 300) {
      if (option.onError) {
        return option.onError(getError(action, option, xhr));
      }
    }

    option.onSuccess(getBody(xhr));
  };

  xhr.open("post", action, true);

  if (option.withCredentials && "withCredentials" in xhr) {
    xhr.withCredentials = true;
  }

  const headers = option.headers || {};

  for (const item in headers) {
    // eslint-disable-next-line no-prototype-builtins
    if (headers.hasOwnProperty(item) && headers[item] !== null) {
      xhr.setRequestHeader(item, headers[item]);
    }
  }
  xhr.send(formData);
  return xhr;
}
