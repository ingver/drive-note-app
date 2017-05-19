export default class Profile {
  constructor(user = null) {
    if (user !== null) {
      const profile = user.getBasicProfile()
      if (profile !== undefined) {
        this.id = profile.getId()
        this.name = profile.getName()
        this.givenName = profile.getGivenName()
        this.familyName = profile.getFamilyName()
        this.imageUrl = profile.getImageUrl()
        this.getEmail = profile.getEmail()
      }
    }
  }
}
