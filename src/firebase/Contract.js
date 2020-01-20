/*
@flow
@format
*/

export class Restaurant {
    static get PATH_BASE(){return 'restaurant'}
}

export class User {
    name:string
    photoURL:string
    tag:string
    totalRecommendations:number
    totalFollowers:number

    static get PATH_BASE(){return 'users'}
    static get CHILD_TAG(){return 'tag'}
}

export class UserData {
    static get PATH_BASE(){return 'userData'}
    static get PATH_PLANS(){return 'plans'}
    static get PATH_FOLLOWERS(){return 'followers'}
    static get PATH_FOLLOWINGS(){return 'following'}
    static get PATH_RECOMMENDATIONS(){return 'recommendations'}
}

export class Plan {
    title:string
    description:string
    plannedForTimestamp:number
    createdAtTimestamp:number
    restaurantKey:string
    restaurant:Restaurant
    priority:number
    creatorUid:string
    members:Array<PlanMember>

    static get PATH_BASE(){return 'plan'}
}

export class PlanMember {
    uid:string
    name:string
    photoURL:string
    status:string

    static get STATUS_PENDING(){return 'PENDING'}
    static get STATUS_INTERESTED(){return 'INTERESTED'}
    static get STATUS_GOING(){return 'GOING'}
    static get STATUS_NOT_GOING(){return 'NOT_GOING'}
}