declare namespace API {
  type Resp<T> = {
    msg: string;
    symbol?: number;
    data: T;
    type?: 'Ok' | 'Fail' | 'Bad Request' | 'Unauthorized' | 'Forbidden' | 'Not Found' | 'Internal Server Error';
  }
  type GETS = {
    "/api/": Resp<string>
    "/api/status": Resp<boolean>
  }

  type POSTS = {
    "/api/stop": Resp<undefined>,
    "/api/start": Resp<undefined>
  }

  interface GET<U extends keyof GETS = keyof GETS> {
    (url: U, options?: RequestInit, timeout?: number): Promise<GETS[U]>
  }

  // POST(url, data, options = {}, timeout)
  interface POST<U extends keyof POSTS = keyof POSTS> {
    (url: U, data?: object, options?: RequestInit, timeout?: number): Promise<POSTS[U]>
  }
}