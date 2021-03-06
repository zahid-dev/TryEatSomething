
export class Strings {
  static get ANDROID_PACKAGE_NAME(){return 'com.eatsnp.app'}
  static get IOS_BUNDLE_ID(){return 'com.eatsnp.app'}
  static get PLACEHOLDER_IMAGE_URL(){return 'https://platerate.com/images/tempfoodnotext.png'}
  static get DYNAMIC_LINK_PREFIX(){return 'eatsnp.page.link'}
  static get DYNAMIC_LINK_URI_PREFIX(){return `https://${this.DYNAMIC_LINK_PREFIX}`}
  static get DYNAMIC_LINK_PLAN_URL(){return `${this.DYNAMIC_LINK_URI_PREFIX}/plan`}
}

export class Images {
  static get BLACK_PIC() {
    return require('./img/black.bmp');
  }
  static get HOWDY() {
    return require('./img/howdy.jpg');
  }
  static get USER() {
    return require('./img/user.png');
  }
  static get SEARCH() {
    return require('./img/search.png');
  }
  static get RESTAURANTS() {
    return require('./img/restaurant.png');
  }
  static get LOGO() {
    return require('./img/logo.png');
  }
  static get EATSNP_BANNER(){
    return require('./img/eatsnp-banner.png')
  }
  static get IC_STAR(){
    return require('./img/ic_star.png')
  }
  static get IC_PLAN(){
    return require('./img/ic_plan.png')
  }
}

export class Colors {
  static get COLOR_PRIMARY(){return '#fe7002'}
  static get COLOR_BLACK(){return '#000'}
  static get COLOR_GRAY(){return 'gray'}
  static get COLOR_MID_GRAY(){ return '#CCCCCC'}
  static get COLOR_LIGHT_GRAY(){return '#f2f2f2'}
  static get COLOR_WHITE(){return 'white'}
}

export class Numbers {
  static get FOURSQUARE_RESULT_LIMIT(){return __DEV__?3:10}
}

export class Screens {
  static get SCREEN_MAKE_PLAN(){return "MakePlan"}
  static get SCREEN_PLAN_DETAILS(){return "PlanDetails"}
  static get SCREEN_USER_SEARCH(){return 'UserSearch'}
  static get SCREEN_INVITE_CONTACTS(){return 'InviteContacts'}
  static get SCREEN_PROFILE(){return "Profile"}
  static get SCREEN_PLANS(){return "Plans"}
}