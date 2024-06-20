document.addEventListener('DOMContentLoaded', () => {

    const awbElement = document.querySelector('.tid-panel h1');
    let trackingId = ''; // Initialize an empty tracking ID

    // Store original content and background color
    const orderTagPanel = document.querySelector('.order-tag-panel');
    const tigerZonePanel = document.querySelector('.tiger-zone-panel');
    const sortHubPanel = document.querySelector('.sort-hub-panel');

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
        if(data.inbound_error == ''){

            tigerZonePanel.style.display = 'flex';
            sortHubPanel.style.display = 'flex';

            orderTagPanel.style.flexBasis = '25%';
            tigerZonePanel.style.flexBasis = '60%';
            sortHubPanel.style.flexBasis = '15%';

            orderTagPanel.style.fontSize = '10mm';
            orderTagPanel.style.marginBottom = '1px';
            orderTagPanel.textContent = data.inbound_tag;
            orderTagPanel.style.backgroundColor = '#26a178d5';

            tigerZonePanel.textContent = data.inbound_zone;
            tigerZonePanel.style.backgroundColor = '#26a178d5';

            sortHubPanel.textContent = 'HUB: ' + data.inbound_hub;
            sortHubPanel.style.backgroundColor = '#26a178d5';

        }else{
            
            tigerZonePanel.style.display = 'none';
            sortHubPanel.style.display = 'none';
            orderTagPanel.style.flexBasis = '100%';

            orderTagPanel.style.marginBottom = '5px';
            orderTagPanel.style.fontSize = '40mm';
            if(data.inbound_error == 'Timeout Scan Again'){
                orderTagPanel.style.backgroundColor = '#eafc50';
            }else{
                orderTagPanel.style.backgroundColor = '#e72a2a';
            }

            orderTagPanel.textContent = data.inbound_error;

            
        }
        
    }
    // Function to fetch new data from the API or server
    async function fetchData(trackingId) {
        try {
            //const response = await fetch('your_api_endpoint'); // Replace with your API endpoint
            //const data = await response.json();
            random_length = parseFloat(Math.random() * (100 - 5) + 5).toFixed(3).toString();
            random_width = parseFloat(Math.random() * (100 - 5) + 5).toFixed(3).toString();
            random_height = parseFloat(Math.random() * (100 - 5) + 5).toFixed(3).toString();
            random_weight = parseFloat(Math.random() * (15 - 5) + 5).toFixed(3).toString();
            inbound_tag_value = '';
            if (trackingId == 'VNDWSREPLY001'){
                inbound_error_value = 'On Hold Parcel (Recovery)';
            }else if(trackingId == 'VNDWSREPLY002'){
                inbound_error_value = 'Completed Parcel';
            }else if(trackingId == 'VNDWSREPLY003'){
                inbound_error_value = 'Returned To Sender Parcel';
            }else if(trackingId == 'VNDWSREPLY004'){
                inbound_error_value = 'Canceled Parcel';
            }else if(trackingId == 'VNDWSREPLY005'){
                inbound_error_value = 'Routed Parcel';
            }else if(trackingId == 'VNDWSREPLY006'){
                inbound_error_value = 'Tranferred to 3PL Parcel';
            }else if(trackingId == 'VNDWSREPLY007'){
                inbound_error_value = 'Routed Parcel';
            }else if(trackingId == 'VNDWSREPLY008'){
                inbound_error_value='';
            }else if(trackingId == 'NVVNSTAMP999999998'){
                inbound_tag_value = 'GTC';
                inbound_error_value='';
            }else if(trackingId == 'VNDWSREPLY010'){
                inbound_error_value='';
            }else if(trackingId == 'INVALID123'){
                inbound_error_value = 'Invalid Parcel';
            }
            else if(trackingId == 'TESTTIMEOUT'){
                inbound_error_value = 'Timeout Scan Again';
            }
            data = {
                tid: trackingId,
                time: '2024-06-19 15:17:29',
                length: random_length,
                width: random_width,
                height: random_height,
                weight: random_weight,
                inbound_tag: inbound_tag_value,
                inbound_zone: '8-1-5-Long Thanh-B20Y4',
                inbound_hub: 'DN - Long Thanh - SOU - SUB 2',
                inbound_error: inbound_error_value,
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

    // Event listener for keypress from the barcode scanner
    document.addEventListener('keydown', (event) => {
        // Ignore "Shift" keys
        if (event.key === 'Shift' || event.key === 'ShiftLeft' || event.key === 'ShiftRight') {
            return;
        }
        // Check for the Enter key or another key that signals the end of input
        if (event.key === 'Enter') {
            awbElement.textContent = `AWB: ${trackingId}`; // Update the display
            fetchData(trackingId.trim()); // Fetch data using the accumulated tracking ID
            trackingId = ''; // Reset the tracking ID
        }else{
            // Accumulate other keys
            trackingId += event.key.toUpperCase();
        }
    });
});
