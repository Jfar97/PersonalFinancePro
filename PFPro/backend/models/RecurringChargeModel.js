// RecurringChargeModel defines the structure of the charge item

module.exports = (sequelize, DataTypes) => {
    const RecurringCharge = sequelize.define("RecurringCharge", {
        // Name of the charge represented by a string
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Amount the charge is for, represented as a decimal to two places
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        // Frequency represents how often the charge repeats
        frequency: {
            type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'annually'),
            allowNull: false,
        },
        // What kind of charge it is, such as subscription or bill
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Unique color based upon the type of charge
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // The next upcoming date that a charge will  occur on
        dateOfCharge: {
            type: DataTypes.DATE,
                allowNull: false,
        },
        // field for the day of the week for a weekly charge, represented as a number 0-6 that correlate to the days of the week
        dayOfWeek: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
                max: 6
            }
        },
        // Field for the day of the month for a monthly or annual charge, represented as an integer of 1-31 which is the maximum number of days a month can have
        dayOfMonth: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 31
            }
        },
        // Field for the month of an annual charge, represented as an integer 1-12 that correlate to the 12 months of the year
        month: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 12
            }
        },
    })

    // Associations
    RecurringCharge.associate = (models) => {
        // Multiple charges can be correlated to a user
        RecurringCharge.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
            },
            onDelete: 'CASCADE'
        })
    }

    return RecurringCharge
}