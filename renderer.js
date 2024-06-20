document.addEventListener('DOMContentLoaded', () => {

    const awbElement = document.querySelector('.tid-panel h1');
    let trackingId = ''; // Initialize an empty tracking ID

    // Store original content and background color
    const orderTagPanel = document.querySelector('.order-tag-panel');
    const tigerZonePanel = document.querySelector('.tiger-zone-panel');
    const sortHubPanel = document.querySelector('.sort-hub-panel');
    const sortZonePanel = document.querySelector('.sort-zone-panel');

    function updateSpans(data) {
        document.getElementById('processedInLastHour').textContent = data.processedInLastHour;
        document.getElementById('parcelsScanned').textContent = data.parcelsScanned;
        document.getElementById('blankDimensionCount').textContent = data.blankDimensionCount;
        document.getElementById('positiveReply').textContent = data.positiveReply;
        document.getElementById('negativeReply').textContent = data.negativeReply;
        document.getElementById('timeoutReply').textContent = data.timeoutReply;
        document.getElementById('deviceId').textContent = data.deviceId;
        document.getElementById('internetStatus').textContent = data.internetStatus;
        document.getElementById('lengthValue').textContent = data.length;
        document.getElementById('widthValue').textContent = data.width;
        document.getElementById('heightValue').textContent = data.height;
        document.getElementById('weightValue').textContent = data.weight;
    }

    // Function to populate the history table with new data
    function populateHistoryTable(data) {
        const historyPanel = document.querySelector('.history-panel');
        historyPanel.scrollTop = 0;
        const historyTable = document.getElementById('history-table');
        const tbody = historyTable.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');

        // Insert new row at the top
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${data.tid}</td>
            <td>${data.weight}</td>
            <td>${data.length}</td>
            <td>${data.width}</td>
            <td>${data.height}</td>
            <td>${data.time}</td>
        `;
        tbody.insertBefore(newRow, rows[0]);

        // Remove the last row if table exceeds 10 rows
        if (rows.length > 9) {
            tbody.removeChild(rows[rows.length - 1]);
        }
    }
    function rendersortzonepanel(data) {
        //const sortzonecontainerpanel = document.querySelector('.sort-zone-container-panel')
        if(data.inbound_statusCode == '200'){

            tigerZonePanel.style.display = 'flex';
            sortHubPanel.style.display = 'flex';

            orderTagPanel.style.flexBasis = '25%';
            tigerZonePanel.style.flexBasis = '60%';
            sortHubPanel.style.flexBasis = '15%';
            
            orderTagPanel.textContent = data.inbound_tag;
            orderTagPanel.style.backgroundColor = '#26a178d5';

            tigerZonePanel.innerHTML = data.inbound_zone;
            tigerZonePanel.style.backgroundColor = '#26a178d5';

            sortHubPanel.innerHTML = 'HUB: ' + data.inbound_hub;
            sortHubPanel.style.backgroundColor = '#26a178d5';
            // orderTagPanel.style.zIndex = '2';
            // tigerZonePanel.style.zIndex = '2';
            // sortHubPanel.style.zIndex = '2';
            // sortZonePanel.style.zIndex = '1'; // Ensure sort-zone-panel is behind

        }else if(data.inbound_statusCode == '504'){
            orderTagPanel.style.flexBasis = '100%';
            orderTagPanel.style.backgroundColor = '#26a178d5';
            tigerZonePanel.style.display = 'none';
            sortHubPanel.style.display = 'none';

            // sortZonePanel.innerHTML = 'TimeOut Scan Again';
            // sortZonePanel.style.backgroundColor = '#eafc50';
        }
        
    }
    // Function to fetch new data from the API or server
    async function fetchData(trackingId) {
        try {
            //const response = await fetch('your_api_endpoint'); // Replace with your API endpoint
            //const data = await response.json();
            data = {
                tid: 'SPEVN2410225923219',
                time: '2024-06-19 15:17:29',
                length: '60.014',
                width: '60.014',
                height: '60.014',
                weight: '2.014',
                inbound_tag: 'GTC',
                inbound_zone: '8-1-5-Long Thanh-B20Y4',
                inbound_hub: 'DN - Long Thanh - SOU - SUB 2',
                inbound_statusCode: trackingId,
                processedInLastHour: 5000,
                parcelsScanned: 10000,
                blankDimensionCount: 500,
                positiveReply: 9000,
                negativeReply: 1000,
                timeoutReply: 0,
                deviceId: "VNDWS-HCM-24B-SR",
                internetStatus: "LAN"
            };

            updateSpans(data);
            populateHistoryTable(data);
            rendersortzonepanel(data);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Event listener for the Enter key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            awbElement.textContent = `AWB: ${trackingId}`; // Update the display
            fetchData(trackingId);
            trackingId = '';
            
        } else {
            trackingId += event.key.toUpperCase();
        }
    });
});
