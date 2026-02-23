export interface CancelablePromise<T> {
    promise: Promise<T>;
    cancel: () => void;
    isCanceled: () => boolean;
  }
  
  export const createCancelablePromise = <T>(
    promise: Promise<T>
  ): CancelablePromise<T> => {
    let canceled = false;
  
    const wrappedPromise = new Promise<T>((resolve, reject) => {
      promise
        .then((value) => {
          if (!canceled) {
            resolve(value);
          }
        })
        .catch((error) => {
          if (!canceled) {
            reject(error);
          }
        });
    });
  
    return {
      promise: wrappedPromise,
      cancel: () => {
        canceled = true;
      },
      isCanceled: () => canceled,
    };
  };