// UserModel.js defines the structure of the User, who has all other items tied to the unique id

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        // Username that will be associated with the account for logging in, must be unique
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        // Email associated with the account being made, must be unique
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true // Validates that the email is in the correct format
            }
        },
        // Password the user uses to log in
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Security question chosen for the account
        securityQuestion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Answer to the security question stored to the account
        securityAnswer: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    })


    User.associate = (models) => {
        // User has multiple budgets
        User.hasMany(
            models.Budget,
        {onDelete: 'CASCADE'}
        )
        // User has multiple charges
        User.hasMany(
            models.RecurringCharge,
            {onDelete: 'CASCADE'}
        )
        // User has multiple events
        User.hasMany(
            models.AccEvent,
            {onDelete: 'CASCADE'}
        )
        // User has multiple savings
        User.hasMany(
            models.Savings,
            { onDelete: 'CASCADE' }
        )
    };

    return User
}