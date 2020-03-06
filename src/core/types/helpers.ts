export interface IPaginationLinks {
  self: string;
  first: string;
  prev?: string;
  next?: string;
  last: string;
}

export interface IJsonApi {
  id: string;
  type: string;
  attributes?: any;
  relationships?: any;
}

export interface IDataJsonApi {
  data: IJsonApi;
}

export interface IFilterWithOperands {
  [key: string]: string[];
}

export interface IKeyValue {
  [key: string]: string;
}
