export interface IPost {
    id:string,
    uid: string;
    body: string;
    date: any;
    tag: string;
    like:number;
    likedBy:string[]
    comment:number;
    username:string;
}
