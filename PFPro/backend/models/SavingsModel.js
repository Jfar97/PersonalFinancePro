// SavingsModel defines the structure of the savings item

module.exports = (sequelize, DataTypes) => {
    const Savings = sequelize.define("Savings", {
        // Name of the savings item as a string
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // The goal that needs to be reached for a savings item, represented as a decimal to two places
        goal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        // How close to the goal the savings currently is, also represented as a decimal to two places, defaults to 0 on creation of a savings item
        currentAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
    });

    //Associations
    Savings.associate = (models) => {
        // Multiple savings item can correlate to one user
        Savings.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        // Savings items will have updates associated as the amount changes, and the id association to the savings is forced in the foreignKey
        Savings.hasMany(models.SavingsUpdate, {
            foreignKey: 'SavingsId',
            onDelete: 'CASCADE'
        });
    };

    return Savings;
};