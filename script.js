document.addEventListener('DOMContentLoaded', () => {
    const profitForm = document.getElementById('profitForm');
    const profitTableBody = document.querySelector('#profitTable tbody');
    const paginationDiv = document.getElementById('pagination');
    const summaryDiv = document.getElementById('summary');
    const deleteAllButton = document.getElementById('deleteAll');
    let editIndex = -1;
    const itemsPerPage = 5;
    let currentPage = 1;

    let profits = JSON.parse(localStorage.getItem('profits')) || [];

    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();

    document.getElementById('searchName').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        currentPage = 1; // Reset to page 1 on search
        renderTable(searchTerm);
    });

    const renderTable = (searchTerm = '') => {
        profitTableBody.innerHTML = '';  // Clear table before rendering

        // Filter based on search term
        const filteredProfits = profits.filter(profit =>
            profit.name.toLowerCase().includes(searchTerm) ||
            profit.status.toLowerCase().includes(searchTerm)
        );

        // Ensure pagination variables are correct
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        // Paginate the filtered profits
        const paginatedProfits = filteredProfits.slice(start, end);

        // If no profits to display, show a message
        if (paginatedProfits.length === 0 && currentPage > 1) {
            currentPage = 1;  // Reset to page 1 if no data on the current page
            renderTable(searchTerm);  // Re-render the table
            return;
        }

        // Render each row and attach click events for modal
        paginatedProfits.forEach((profit, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${profit.name}</td>
                <td>${parseFloat(profit.transfer).toFixed(2)}</td>
                <td>${parseFloat(profit.profit).toFixed(2)}</td>
                <td>${profit.status}</td>
                <td>${profit.date}</td>
            `;
            // Add click event to the row
            row.onclick = () => openModalForRow(start + index);  // Use start + index to ensure global index
            profitTableBody.appendChild(row);
        });

        // Re-render pagination and summary
        renderPagination(filteredProfits.length);  // Total items in the filtered list
        renderSummary(filteredProfits);  // Only filtered profits for summary
    };

    const renderPagination = (totalItems = profits.length) => {
        paginationDiv.innerHTML = '';
        const pageCount = Math.ceil(totalItems / itemsPerPage);

        const maxVisibleButtons = 5; // Number of pagination buttons to show
        const firstPage = Math.max(1, currentPage - 2); // Start page for pagination
        const lastPage = Math.min(pageCount, currentPage + 2); // End page for pagination

        // Add previous button
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Prev';
            prevButton.className = 'btn btn-secondary btn-sm mx-1';
            prevButton.onclick = () => {
                currentPage -= 1;
                renderTable(document.getElementById('searchName').value.toLowerCase());
            };
            paginationDiv.appendChild(prevButton);
        }

        // Add first page and ellipsis if necessary
        if (firstPage > 1) {
            const firstButton = document.createElement('button');
            firstButton.textContent = '1';
            firstButton.className = 'btn btn-secondary btn-sm mx-1';
            firstButton.onclick = () => {
                currentPage = 1;
                renderTable(document.getElementById('searchName').value.toLowerCase());
            };
            paginationDiv.appendChild(firstButton);

            if (firstPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationDiv.appendChild(ellipsis);
            }
        }

        // Add page buttons within the range
        for (let i = firstPage; i <= lastPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = 'btn btn-secondary btn-sm mx-1';
            pageButton.onclick = () => {
                currentPage = i;
                renderTable(document.getElementById('searchName').value.toLowerCase());
            };
            if (i === currentPage) {
                pageButton.disabled = true;
            }
            paginationDiv.appendChild(pageButton);
        }

        // Add last page and ellipsis if necessary
        if (lastPage < pageCount) {
            if (lastPage < pageCount - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationDiv.appendChild(ellipsis);
            }

            const lastButton = document.createElement('button');
            lastButton.textContent = pageCount;
            lastButton.className = 'btn btn-secondary btn-sm mx-1';
            lastButton.onclick = () => {
                currentPage = pageCount;
                renderTable(document.getElementById('searchName').value.toLowerCase());
            };
            paginationDiv.appendChild(lastButton);
        }

        // Add next button
        if (currentPage < pageCount) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.className = 'btn btn-secondary btn-sm mx-1';
            nextButton.onclick = () => {
                currentPage += 1;
                renderTable(document.getElementById('searchName').value.toLowerCase());
            };
            paginationDiv.appendChild(nextButton);
        }
    };

    const renderSummary = () => {
        const totalTransfer = profits.reduce((sum, profit) => sum + parseFloat(profit.transfer), 0).toFixed(2);
        const totalProfit = profits.reduce((sum, profit) => sum + parseFloat(profit.profit), 0).toFixed(2);

        const totalTransferPaid = profits
            .filter(profit => profit.status === 'Paid')
            .reduce((sum, profit) => sum + parseFloat(profit.transfer), 0)
            .toFixed(2);

        const totalTransferPending = profits
            .filter(profit => profit.status === 'Pending')
            .reduce((sum, profit) => sum + parseFloat(profit.transfer), 0)
            .toFixed(2);

        const totalProfitPaid = profits
            .filter(profit => profit.status === 'Paid')
            .reduce((sum, profit) => sum + parseFloat(profit.profit), 0)
            .toFixed(2);

        const totalProfitPending = profits
            .filter(profit => profit.status === 'Pending')
            .reduce((sum, profit) => sum + parseFloat(profit.profit), 0)
            .toFixed(2);

        const statusCounts = profits.reduce((counts, profit) => {
            counts[profit.status] = (counts[profit.status] || 0) + 1;
            return counts;
        }, {});

        const statusCountsHtml = `
            <div class="summary-item"><span class="summary-title">Paid:</span> <span>${statusCounts['Paid'] || 0}</span></div>
            <div class="summary-item"><span class="summary-title">Pending:</span> <span>${statusCounts['Pending'] || 0}</span></div>
        `;

        summaryDiv.innerHTML = `
            <div class="summary-item" style="display: flex; justify-content: space-between;">
                <span class="summary-title">Total Transfer:</span>
                <span>RM ${totalTransfer}</span>
            </div>
            <div class="summary-item" style="display: flex; justify-content: space-between;">
                <span class="summary-title">Total Profit:</span>
                <span>RM ${totalProfit}</span>
            </div>
            <div class="summary-item" style="display: flex; justify-content: space-between;">
                <span class="summary-title">Total Transfer (Paid):</span>
                <span>RM ${totalTransferPaid}</span>
            </div>
            <div class="summary-item" style="display: flex; justify-content: space-between;">
                <span class="summary-title">Total Transfer (Pending):</span>
                <span>RM ${totalTransferPending}</span>
            </div>
            <div class="summary-item" style="display: flex; justify-content: space-between;">
                <span class="summary-title">Total Profit (Paid):</span>
                <span>RM ${totalProfitPaid}</span>
            </div>
            <div class="summary-item" style="display: flex; justify-content: space-between;">
                <span class="summary-title">Total Profit (Pending):</span>
                <span>RM ${totalProfitPending}</span>
            </div>
            ${statusCountsHtml}
        `;
    };

    const saveProfits = () => {
        localStorage.setItem('profits', JSON.stringify(profits));
    };

    profitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const transfer = parseFloat(document.getElementById('transfer').value).toFixed(2);
        const profit = parseFloat(document.getElementById('profit').value).toFixed(2);
        const status = document.getElementById('status').value;
        const date = document.getElementById('date').value;

        console.log('Form Submitted:', { name, transfer, profit, status, date });

        if (editIndex === -1) {
            profits.push({ name, transfer, profit, status, date });
        } else {
            profits[editIndex] = { name, transfer, profit, status, date };
            editIndex = -1;
        }

        saveProfits();
        renderTable();
        profitForm.reset();
        document.getElementById('date').valueAsDate = new Date(); // Reset date to today
    });

    // Open modal for the correct row, using the global index
    window.openModalForRow = (globalIndex) => {
        const profit = profits[globalIndex];
        document.getElementById('updateName').value = profit.name;
        document.getElementById('updateTransfer').value = parseFloat(profit.transfer).toFixed(2);
        document.getElementById('updateProfit').value = parseFloat(profit.profit).toFixed(2);
        document.getElementById('updateStatus').value = profit.status;
        document.getElementById('updateDate').value = profit.date;

        // Update the global editIndex to be used for update or delete actions
        editIndex = globalIndex;

        // Show the modal for updating or deleting
        const rowModal = new bootstrap.Modal(document.getElementById('updateProfitModal'));
        rowModal.show();
    };

    // Save the updated profit data
    document.getElementById('saveUpdate').addEventListener('click', () => {
        const name = document.getElementById('updateName').value;
        const transfer = parseFloat(document.getElementById('updateTransfer').value).toFixed(2);
        const profit = parseFloat(document.getElementById('updateProfit').value).toFixed(2);
        const status = document.getElementById('updateStatus').value;
        const date = document.getElementById('updateDate').value;

        if (editIndex !== -1) {
            // Update the profit at the correct global index
            profits[editIndex] = { name, transfer, profit, status, date };
            saveProfits();  // Save the updated profits list to local storage
            renderTable(document.getElementById('searchName').value.toLowerCase());  // Re-render the table
            editIndex = -1;  // Reset the edit index

            // Hide the modal after saving the update
            const rowModal = bootstrap.Modal.getInstance(document.getElementById('updateProfitModal'));
            rowModal.hide();
        }
    });

    // Delete the profit based on the correct global index
    document.getElementById('deleteProfit').addEventListener('click', () => {
        if (editIndex !== -1) {
            profits.splice(editIndex, 1);  // Remove the correct profit by global index
            saveProfits();                 // Save the updated list to local storage
            renderTable();                 // Re-render the table with the updated data

            // Hide the modal after deletion
            const rowModal = bootstrap.Modal.getInstance(document.getElementById('updateProfitModal'));
            rowModal.hide();
        }
    });

    // Show the modal when "Delete All" is clicked
    deleteAllButton.addEventListener('click', () => {
        const deleteAllModal = new bootstrap.Modal(document.getElementById('deleteAllModal'));
        deleteAllModal.show();
    });

    // Handle the confirmation of the delete action
    document.getElementById('confirmDeleteAll').addEventListener('click', () => {
        profits = [];
        saveProfits();
        renderTable();

        // Hide the modal after deletion
        const deleteAllModal = bootstrap.Modal.getInstance(document.getElementById('deleteAllModal'));
        deleteAllModal.hide();
    });

    document.getElementById('importExcel').addEventListener('click', () => {
        const worksheet = XLSX.utils.json_to_sheet(profits);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Profits');

        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const formattedTime = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS

        const filename = `Profit Tracker ${formattedDate} ${formattedTime}.xlsx`;
        XLSX.writeFile(workbook, filename);
    });

    PullToRefresh.init({
        mainElement: 'body', // Specify the main element
        onRefresh: function() {
            window.location.reload(); // Refresh the page
        }
    });

    renderTable();
});
