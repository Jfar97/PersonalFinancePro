// ExpenseDisplay is the component that formats and displays the data of an expense item

// Imports
import React from 'react';
import {TrashIcon} from "@heroicons/react/24/solid/index.js";

function ExpenseDisplay({expense, onDelete}) {
    // Function that handles the delete call for the delete button
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this expense?')) {
            onDelete(expense.id);
        }
    };

    // Returns the expense data displayed in a bordered box with columns
    return (
        <div key={expense.id} className="expense-item">
            {/* Name Column */}
            <span>{expense.name}</span>

            {/* Cost Column */}
            <span>${expense.cost}</span>

            {/* Budget Column */}
            {expense.Budget && (
                // Only show budget name if it's available
                // This was used for debugging during the initial syncing of the expense items to the budgets, most likely can be removed
                <>
                    <span>{expense.Budget.name}</span>
                </>
            )}

            {/* Created-At Date Column */}
            <span>{new Date(expense.createdAt).toLocaleDateString()}</span>

            {/* Delete Button Column */}
            <button
                className="delete-button"
                onClick={handleDelete}
            >
                <TrashIcon width={20} height={20} />
            </button>
        </div>
    );
}

export default ExpenseDisplay;