export class AuthUserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    bio: string;
    location: string;
    createdAt: Date;

    constructor(
        id: string,
        email: string,
        firstName: string,
        lastName: string,
        avatar: string,
        bio: string,
        location: string,
        createdAt: Date
    ) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatar = avatar;
        this.bio = bio;
        this.location = location;
        this.createdAt = createdAt;
    }

    static generateDummyProfile(): AuthUserProfile {
        return new AuthUserProfile(
            "user_123",
            "johndoe@email.com",
            "John",
            "Doe",
            "https://via.placeholder.com/100",
            "Foodie and coffee lover. Exploring Andorra one café at a time.",
            "Andorra la Vella, Andorra",
            new Date("2024-01-01")
        );
    }
}
