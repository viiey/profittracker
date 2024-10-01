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

    const renderTable = () => {
        profitTableBody.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedProfits = profits.slice(start, end);

        paginatedProfits.forEach((profit, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${profit.name}</td>
                <td>${parseFloat(profit.profit).toFixed(2)}</td>
                <td>${profit.status}</td>
                <td>${profit.date}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm update" onclick="editProfit(${start + index})">Update</button>
                    <button class="btn btn-outline-primary btn-sm delete" onclick="deleteProfit(${start + index})">Delete</button>
                </td>
            `;
            profitTableBody.appendChild(row);
        });

        renderPagination();
        renderSummary();
    };

    const renderPagination = () => {
        paginationDiv.innerHTML = '';
        const pageCount = Math.ceil(profits.length / itemsPerPage);
        for (let i = 1; i <= pageCount; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = 'btn btn-secondary btn-sm mx-1';
            pageButton.onclick = () => {
                currentPage = i;
                renderTable();
            };
            if (i === currentPage) {
                pageButton.disabled = true;
            }
            paginationDiv.appendChild(pageButton);
        }
    };

    const renderSummary = () => {
        const totalProfit = profits.reduce((sum, profit) => sum + parseFloat(profit.profit), 0).toFixed(2);
        const statusCounts = profits.reduce((counts, profit) => {
            counts[profit.status] = (counts[profit.status] || 0) + 1;
            return counts;
        }, {});

        let statusCountsHtml = '';
        for (const [status, count] of Object.entries(statusCounts)) {
            statusCountsHtml += `<p>${status}: ${count}</p>`;
        }

        summaryDiv.innerHTML = `
            <p>Total Profit: ${totalProfit}</p>
            ${statusCountsHtml}
        `;
    };

    const saveProfits = () => {
        localStorage.setItem('profits', JSON.stringify(profits));
    };

    profitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const profit = parseFloat(document.getElementById('profit').value).toFixed(2);
        const status = document.getElementById('status').value;
        const date = document.getElementById('date').value;

        console.log('Form Submitted:', { name, profit, status, date });

        if (editIndex === -1) {
            profits.push({ name, profit, status, date });
        } else {
            profits[editIndex] = { name, profit, status, date };
            editIndex = -1;
        }

        saveProfits();
        renderTable();
        profitForm.reset();
        document.getElementById('date').valueAsDate = new Date(); // Reset date to today
    });

    window.editProfit = (index) => {
        const profit = profits[index];
        document.getElementById('name').value = profit.name;
        document.getElementById('profit').value = parseFloat(profit.profit).toFixed(2);
        document.getElementById('status').value = profit.status;
        document.getElementById('date').value = profit.date;
        editIndex = index;
    };

    window.deleteProfit = (index) => {
        profits.splice(index, 1);
        saveProfits();
        renderTable();
    };

    deleteAllButton.addEventListener('click', () => {
        profits = [];
        saveProfits();
        renderTable();
    });

    renderTable();
});
