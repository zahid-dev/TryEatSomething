/*
@flow
@format
*/

export class Restaurant {

}

export class UserData {
    static get PATH_PLANS(){return 'plans'}
}

export class Plan {
    title:string
    description:string
    plannedForTimestamp:number
    createdAtTimestamp:number
    restaurantKey:string
    restaurant:Restaurant
    members:Array<{
        uid:string,
        name:string,
        photoURL:string,
        status:string
    }>

    static get PATH_BASE(){return 'plan'}
}