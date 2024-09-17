// SavingsUpdateModel defines the structure of saved updates whenever a savings item has its amount changed

module.exports = (sequelize, DataTypes) => {
    const SavingsUpdate = sequelize.define("SavingsUpdate", {
        // The amount added or subtracted towards the saving's goal, represented as a number to two decimal places
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        // An optional field to add a description to the update
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // SavingsId field was added to force the association in the database with the savings item, as there were issues with the cascade delete not applying
        SavingsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    //Associations
    SavingsUpdate.associate = (models) => {
        // Multiple savings updates can be applied to a savings item
        SavingsUpdate.belongsTo(models.Savings, {
            foreignKey: 'SavingsId',
            onDelete: 'CASCADE'
        });
    };

    return SavingsUpdate;
};