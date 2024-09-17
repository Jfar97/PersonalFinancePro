// RecurringChargeDisplay is the component that organizes the data of a charge item and displays it

// Imports
import React from 'react';
import {TrashIcon} from "@heroicons/react/24/solid/index.js";

function RecurringChargeDisplay({charge, onDelete, getNextChargeDate, formatDate}) {
    // Handles the deletion of a charge item
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this charge?')) {
            onDelete(charge.id);
        }
    };

    // Styles the charge item color to use the associated color found in the database
    const chargeItemStyle = {
        '--event-color': charge.color, // Set the CSS variable to match EventDisplay
        backgroundColor: `${charge.color}10`, // Transparent background (10% opacity)
    };

    // Styles the background of the Type Display column to have a darker background
    const chargeTypeStyle = {
        backgroundColor: `${charge.color}80`, // 80 represents 50% opacity
        padding: '2px 5px',
        borderRadius: '3px',
        color: 'black',
        textShadow: '0 0 1px rgba(0, 0, 0, 0.5)',
    };

    // Uses passed in formatting function to format the start date and end date if it exists
    const nextChargeDate = getNextChargeDate(charge);
    const formattedNextChargeDate = formatDate(nextChargeDate);

    // Returns a charge item with all information split into columns lined up in a row
    return (
        <div key={charge.id} className="charge-item" style={chargeItemStyle}>
            {/* Name Column */}
            <span>{charge.name}</span>

            {/* Amount Column */}
            <span>${charge.amount}</span>

            {/* Frequency Column */}
            <span>{charge.frequency}</span>

            {/* Type Column */}
            <span style={chargeTypeStyle}>{charge.type}</span>

            {/* Next Charge Date Column */}
            <span>Next charge: {formattedNextChargeDate}</span>

            {/* Delete Button Column */}
            <button
                className="delete-button"
                onClick={handleDelete}
            >
                <TrashIcon width={20} height={20}/>
            </button>

        </div>
    );
}

export default RecurringChargeDisplay;