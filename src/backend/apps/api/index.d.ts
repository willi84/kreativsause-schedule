export type LINK = {
    text: string;
    href: string;
}
export type WORKSHOP_ITEM = {
    id: string;
    title: string;
    description?: string[];
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    slug?: string;
    kosten?: string;
    category: string[];
    tags?: string[];
    register?: string;
    organizer?: string;
    venue?: string[];
    sections: string[];
    warnings: string[];
    speakers: string[];
    days?: string[];
    year?: string;
    images?: string[];
    links?: LINK[];
}
export type RAW_WOOM = {
    [key: string]: string|null;
}
export type RAW_ROOMS = RAW_WOOM[];
export type WORKSHOP_ITEM_ELEMENT = {
    [key: string]: WORKSHOP_ITEM;
}
export type WORKSHOP_ITEMS = WORKSHOP_ITEM[];

export type WORKSHOP_DATA = {
    data: { [key: string]: WORKSHOP_ITEMS};
    days: string[];
}

export type WORKSHOP_BASE = {
    id: string;
    title: string;
}
export type ROOM_MAPPING = {
    [key: string]: string;
}
export type ID_LIST = string[];

export type ID_MAP = {
    [key: string]: ID_LIST;
}
export type ROOM_ITEM = { orig: string, normalized: string}
export type ROOM_MAP = {
    [key: string]: ROOM_ITEM[];
}