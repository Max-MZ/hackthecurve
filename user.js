class UserProfile {
    constructor(transport, name, age, email) {
        this.transport = transport;
        this.name = name;
        this.age = age;
        this.email = email;

    }
}

module.exports.UserProfile = UserProfile;