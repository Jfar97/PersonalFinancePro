// BudgetModel defines the structure of the Budget item

module.exports = (sequelize, DataTypes) => {
    const Budget = sequelize.define("Budget", {
        // Name of the budget represented as a string
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Amount portioned to the budget represented as a decimal to 2 places
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    })

    // Associations
    Budget.associate = (models) => {
        // Multiple budgets can be associated to a user
        Budget.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            },
            onDelete: 'CASCADE'
        });
        // Budgets will have expense items to represent how much of the budget has been used
        Budget.hasMany(
            models.Expense,
            {onDelete: 'CASCADE'}
        );
    };

    return Budget
}