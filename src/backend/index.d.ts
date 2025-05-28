export type PROJECT = {
    name: string;
    maintainers: Array<any>; // TODO
    tags: Array<string>;
    description: string;
    addedAt: string;
    url: string;
    image: string;
}

export type ITEM = {
    key: string;
    value: string;
}
export type HTTPStatusBase = {
    protocol: string;
    protocolVersion: string;
    status: string;
    statusMessage: string;
    server: string;
    date: string;
    contentType: string;
    // Define other common properties here
    [key: string]: string;
}

export type HTTP_STATUS = HTTPStatusBase & {
    // Define specific properties for status code 200
    contentLength: string;
    lastModified: string;
}

export type HTTP_STATUS_300 = HTTPStatusBase & {
    // Define specific properties for status code 300
    location: string;
}
export type HTTP_OBJECTS = {
    [key: string]: HTTPStatusBase;
}
export type IMAGE_UPDATE = {
    url: string;
    httpItem: HTTPStatusBase;
}
export type ERROR_TYPE = number;

// export interface Profile {
//     id: string;
//     url: string;
//     imageUrl: string;
//     lastModified: Date;
//     size: string;
// }
export type SPEAKER = {
    id: string;
    name: string;
    bio: string;
    image: string;
    slug: string;
}
export type TAG = {
    id: string;
    name: string;
    description: string;
    slug: string;
}
export type TALK = {
    id: string;
    title: string;
    description: string;
    speakers: SPEAKER[];
    tags: TAG[];
    date: string;
    startTime: string;
    endTime: string;
    stage: string;
    slug: string;
}

export type STAGE = {
    id: string;
    name: string;
    description: string;
    slug: string;
    color: string;
    talks: TALK[];
}