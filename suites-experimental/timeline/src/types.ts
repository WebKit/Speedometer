export interface TimelineCard {
    id: string;
    title: string;
    description: string;
    links: { wikipedia: string; [key: string]: string };
    tags: string[];
    year?: string | number;
    image?: string;
    video?: string;
    icon?: string;
}
