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
          fetchUrl = url+'&format=text';
        }
        else {
          fetchUrl = url+'?format=text';
        }
      }
      else {
        fetchUrl = url.replace(`format=${selectFormat.value}`, 'format=text');
      }
    }
    fetchUrl = fetchUrl.replace('&includerestricted=false', '').replace('?includerestricted=false', '?').replace(/\?$/, '');
    fetchUrl = fetchUrl.replace('&includeavailability=true', '').replace('?includeavailability=true', '?').replace(/\?$/, '');
    fetchUrl = fetchUrl.replace(`&updateafter=${updateAfter.value}`, '').replace(`?updateafter=${updateAfter.value}`, '?').replace(/\?$/, '');
    fetchUrl = fetchUrl.replace('&matchtimeseries=true', '').replace('?matchtimeseries=true', '?').replace(/\?$/, '');
    fetchUrl = fetchUrl.replace('&nodata=404', '').replace('?nodata=404', '?').replace(/\?$/, '');
    fetchUrl = fetchUrl.replace('&formatted=true', '').replace('?formatted=true', '?').replace(/\?$/, '');

    // get map icons
    var icons = {
      'HL': L.icon({iconUrl: './images/HL.png'}),
      'HA': L.icon({iconUrl: './images/HA.png'}),
      'HC': L.icon({iconUrl: './images/HC.png'}),
      'HT': L.icon({iconUrl: './images/HT.png'}),
      'HP': L.icon({iconUrl: './images/HP.png'}),
      'HI': L.icon({iconUrl: './images/HI.png'}),
      'CQ': L.icon({iconUrl: './images/CQ.png'}),
      '1Y': L.icon({iconUrl: './images/1Y.png'}),
      'ME': L.icon({iconUrl: './images/ME.png'}),
      '5S': L.icon({iconUrl: './images/5S.png'}),
      'EG': L.icon({iconUrl: './images/EG.png'}),
      'YB': L.icon({iconUrl: './images/YB.png'}),
      'X5': L.icon({iconUrl: './images/X5.png'}),
      'OTHERS': L.icon({iconUrl: './images/others.png'})
    }

    // fetch stations
    fetch(fetchUrl)
    .then(response => response.text())
    .then(data => {
      for (l of data.split('\n').slice(1)) {
        if (l) {
          let fields = l.split('|')
          let marker = L.marker([fields[2], fields[3]], {icon: icons[fields[0]] || icons['OTHERS']}).addTo(map);
          marker.bindPopup(`Network: ${fields[0]}<br>Station: ${fields[1]}`);
        }
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
}
