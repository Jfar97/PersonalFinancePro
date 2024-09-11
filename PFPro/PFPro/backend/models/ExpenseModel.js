//ExpenseModel defines the structure of the expense item

module.exports = (sequelize, DataTypes) => {
    const Expense = sequelize.define("Expense", {
        // Name of the expense represented as a string
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Cost of the expense item represented as a decimal to 2 places
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    })

    //Associations
    Expense.associate = (models) => {
        // Budget has multiple expenses related to it
        Expense.belongsTo(models.Budget, {
            foreignKey: {
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
    };

    // Returns the Expense model
    return Expense
}