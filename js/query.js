function serialize(form, loc='query') {
	if ( !form || form.nodeName !== "FORM" ) {
		return;
	}

	var query = loc;
	var element, option, i, j, q = [];
	for ( i = 0; element = form.elements[i]; i++ ) {
		if ( element.name === "" || element.disabled || element.offsetParent === null ) {
			continue;
		}

		// the queryauth input is treated separately
		if ( element.name === 'queryauth' ) {
			if ( element.checked ) {
				query = element.value;
			}
			continue;
		}


		switch ( element.nodeName ) {
		case 'INPUT':
			if ( element.value == "" ) {
				break;
			}

			switch ( element.type ) {
			case 'text':
			case 'number':
			case 'hidden':
			case 'password':
			case 'button':
			case 'reset':
      case 'date':
        q.push(element.name + "=" + encodeURIComponent(element.value));
        break;

			case 'submit':
				q.push(element.name + "=" + encodeURIComponent(element.value));
				break;

			case 'checkbox':
			case 'radio':
				if ( element.checked ) {
					q.push(element.name + "=" + encodeURIComponent(element.value));
				}
				break;

			case 'file':
				break;
			}

			break;

		case 'TEXTAREA':
			if ( element.value == "" ) {
				break;
			}

			q.push(element.name + "=" + encodeURIComponent(element.value));
			break;

		case 'SELECT':
			switch ( element.type ) {
			case 'select-one':
				if ( element.value == "" ) {
					break;
				}

				q.push(element.name + "=" + encodeURIComponent(element.value));
				break;

			case 'select-multiple':
				values = null
				for ( j = 0; option = element.options[j]; j++ ) {
					if ( option.selected ) {
						v = encodeURIComponent(option.value)
						if ( values === null ) {
							values = v;
						}
						else {
							values += "," + v;
						}
					}
				}
				if ( values !== null ) {
					q.push(element.name + "=" + values);
				}
				break;
			}
			break;

		case 'BUTTON':
			if ( element.value == "" ) {
				break;
			}

			switch ( element.type ) {
			case 'reset':
			case 'submit':
			case 'button':
				q.push(element.name + "=" + encodeURIComponent(element.value));
				break;
			}
			break;
		}
	}

	var params = q.join("&");
	return params.length === 0 ? query : query + '?' + params;
}

function fdsnwsInitQueryForm() {

  var queryForm = document.getElementById('query-form');
  var queryURL = document.getElementById('query-url');

	function updateQueryURL() {
		var url = 'https://eida.gein.noa.gr/fdsnws/station/1/' + serialize(queryForm)
		queryURL.setAttribute('href', url);
		queryURL.innerHTML = url;
	}

	function toggleLocation() {
		for ( i = 0; radio = locRadios[i]; i++ ) {
			var input = document.getElementById(radio.id + '-input');
			if ( input ) {
				input.style.display = radio.checked ? 'block' : 'none';
			}
		}
    updateQueryURL();
	}

	var element, i;
	var elements = queryForm.getElementsByTagName('input');
	var locRadios = []
	for ( i = 0; element = elements[i]; i++ ) {
		if ( element.type === 'radio' && element.name === 'location' ) {
			locRadios.push(element);
			element.onclick = toggleLocation;
		}
    else {
			element.oninput = updateQueryURL
			element.onchange = updateQueryURL
		}
	}

  var elements = queryForm.getElementsByTagName('select');
	for ( i = 0; element = elements[i]; i++ ) {
		element.onchange = updateQueryURL
	}

	toggleLocation();
  updateQueryURL();
}

function mapStations() {
  // get useful elements
  var queryForm = document.getElementById('query-form');
  var queryURL = document.getElementById('query-url');
  var selectLevel = document.getElementsByName('level')[0];
  var selectFormat = document.getElementsByName('format')[0];
  var updateAfter = document.getElementsByName('updateafter')[0];
  var url = 'https://eida.gein.noa.gr/fdsnws/station/1/' + serialize(queryForm)

  // clear map
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // fetch stations if station level
  if (selectLevel.value === '') {

    // define url used to fetch stations for the map
    var fetchUrl = url;
    if (selectFormat.value !== 'text') {
      if (!url.includes('format=')) {
        if (url.includes('query?')) {
          fetchUrl = url+'&format=text&level=channel';
        }
        else {
          fetchUrl = url+'?format=text&level=channel';
        }
      }
      else {
        fetchUrl = url.replace(`format=${selectFormat.value}`, 'format=text&level=channel');
      }
    }
    fetchUrl = fetchUrl.replace('&includeavailability=true', '').replace('?includeavailability=true', '?').replace(/\?$/, '');
    fetchUrl = fetchUrl.replace(`&updateafter=${updateAfter.value}`, '').replace(`?updateafter=${updateAfter.value}`, '?').replace(/\?$/, '');
    fetchUrl = fetchUrl.replace('&matchtimeseries=true', '').replace('?matchtimeseries=true', '?').replace(/\?$/, '');
    fetchUrl = fetchUrl.replace('&nodata=404', '').replace('?nodata=404', '?').replace(/\?$/, '');
    fetchUrl = fetchUrl.replace('&formatted=true', '').replace('?formatted=true', '?').replace(/\?$/, '');

    // get map icons
    var icons = {
      'HL': [L.icon({iconUrl: './images/HL_H.png'}), L.icon({iconUrl: './images/HL_N.png'})],
      'HA': [L.icon({iconUrl: './images/HA_H.png'}), L.icon({iconUrl: './images/HA_N.png'})],
      'HC': [L.icon({iconUrl: './images/HC_H.png'}), L.icon({iconUrl: './images/HC_N.png'})],
      'HT': [L.icon({iconUrl: './images/HT_H.png'}), L.icon({iconUrl: './images/HT_N.png'})],
      'HP': [L.icon({iconUrl: './images/HP_H.png'}), L.icon({iconUrl: './images/HP_N.png'})],
      'HI': [L.icon({iconUrl: './images/HI_H.png'}), L.icon({iconUrl: './images/HI_N.png'})],
      'CQ': [L.icon({iconUrl: './images/CQ_H.png'}), L.icon({iconUrl: './images/CQ_N.png'})],
      '1Y': [L.icon({iconUrl: './images/1Y_H.png'}), L.icon({iconUrl: './images/1Y_N.png'})],
      'ME': [L.icon({iconUrl: './images/ME_H.png'}), L.icon({iconUrl: './images/ME_N.png'})],
      '5S': [L.icon({iconUrl: './images/5S_H.png'}), L.icon({iconUrl: './images/5S_N.png'})],
      'EG': [L.icon({iconUrl: './images/EG_H.png'}), L.icon({iconUrl: './images/EG_N.png'})],
      'YB': [L.icon({iconUrl: './images/YB_H.png'}), L.icon({iconUrl: './images/YB_N.png'})],
      'X5': [L.icon({iconUrl: './images/X5_H.png'}), L.icon({iconUrl: './images/X5_N.png'})],
			'5B': [L.icon({iconUrl: './images/5B_H.png'}), L.icon({iconUrl: './images/5B_N.png'})],
			'MK': [L.icon({iconUrl: './images/MK_H.png'}), L.icon({iconUrl: './images/MK_N.png'})],
      'OTHERS': [L.icon({iconUrl: './images/others_H.png'}), L.icon({iconUrl: './images/others_N.png'})]
    }

		const stations = new Set();
    // fetch stations
    fetch(fetchUrl)
    .then(response => response.text())
    .then(data => {
      for (l of data.split('\n').slice(1)) {
        if (l) {
          let fields = l.split('|')
					if (!stations.has(fields[1])) {
        		stations.add(fields[1]);
            if (fields[3].startsWith('HH')) {
              icon = icons[fields[0]][0] || icons['OTHERS'][0];
            }
						else {
              icon = icons[fields[0]][1] || icons['OTHERS'][1];
            }
          	let marker = L.marker([fields[4], fields[5]], {icon: icon}).addTo(map);
          	marker.bindPopup(`Network: ${fields[0]}<br>Station: ${fields[1]}`);
					}
        }
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
}
