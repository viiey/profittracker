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
        renderTable(searchTerm);
    });

    const renderTable = (searchTerm = '') => {
        profitTableBody.innerHTML = '';
        const filteredProfits = profits.filter(profit => profit.name.toLowerCase().includes(searchTerm));
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedProfits = filteredProfits.slice(start, end);

        paginatedProfits.forEach((profit, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${profit.name}</td>
                <td>${parseFloat(profit.transfer).toFixed(2)}</td>
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

        renderPagination(filteredProfits.length);
        renderSummary(filteredProfits);
    };

    const renderPagination = (totalItems = profits.length) => {
        paginationDiv.innerHTML = '';
        const pageCount = Math.ceil(totalItems / itemsPerPage);
        for (let i = 1; i <= pageCount; i++) {
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
    };

    const renderSummary = (filteredProfits = profits) => {
        const totalTransfer = filteredProfits.reduce((sum, profit) => sum + parseFloat(profit.transfer), 0).toFixed(2);
        const totalProfit = filteredProfits.reduce((sum, profit) => sum + parseFloat(profit.profit), 0).toFixed(2);
        const statusCounts = filteredProfits.reduce((counts, profit) => {
            counts[profit.status] = (counts[profit.status] || 0) + 1;
            return counts;
        }, {});

        let statusCountsHtml = '';
        for (const [status, count] of Object.entries(statusCounts)) {
            statusCountsHtml += `<p>${status}: ${count}</p>`;
        }

        summaryDiv.innerHTML = `
            <p>Total Transfer: ${totalTransfer}</p>
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

    window.editProfit = (index) => {
        const profit = profits[index];
        document.getElementById('name').value = profit.name;
        document.getElementById('transfer').value = parseFloat(profit.transfer).toFixed(2);
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

    renderTable();
});
