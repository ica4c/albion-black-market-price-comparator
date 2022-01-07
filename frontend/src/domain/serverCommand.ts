export interface ServerCommand<T = any> {
  type: string;
  data?: T
}
