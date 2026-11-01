const dateForm = document.getElementById('dateForm');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const apiKeyInput = document.getElementById('apiKey');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const gallery = document.getElementById('gallery');
const galleryStatus = document.getElementById('galleryStatus');
const spaceFact = document.getElementById('spaceFact');
const detailModal = document.getElementById('detailModal');
const closeModalButton = document.getElementById('closeModal');
const modalMedia = document.getElementById('modalMedia');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalCredit = document.getElementById('modalCredit');
const modalExplanation = document.getElementById('modalExplanation');
const earliestApodDate = '1995-06-16';

const spaceFacts = [
	'Neutron stars can spin hundreds of times every second.',
	'There are more stars in the observable universe than grains of sand on Earth.',
	'One day on Venus is longer than one year on Venus.',
	'The footprints left on the Moon can last for millions of years.',
	'Light from the Sun takes about eight minutes to reach Earth.'
];

function getDateString(date) {
	return date.toISOString().slice(0, 10);
}

function setDefaultDates() {
	const today = new Date();
	const latestDate = getDateString(today);
	const lastAvailableDay = new Date(today);
	lastAvailableDay.setUTCDate(lastAvailableDay.getUTCDate() - 1);
	const startDate = new Date(lastAvailableDay);
	startDate.setUTCDate(startDate.getUTCDate() - 8);
	const endDate = getDateString(lastAvailableDay);

	startDateInput.value = getDateString(startDate);
	endDateInput.value = endDate;
	startDateInput.min = earliestApodDate;
	endDateInput.min = earliestApodDate;
	startDateInput.max = latestDate;
	endDateInput.max = latestDate;
}

function showRandomSpaceFact() {
	const randomIndex = Math.floor(Math.random() * spaceFacts.length);
	spaceFact.textContent = spaceFacts[randomIndex];
}

function formatDate(dateString) {
	const date = new Date(`${dateString}T12:00:00Z`);
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(date);
}

function validateDateRange(startDate, endDate) {
	const startTime = Date.parse(`${startDate}T00:00:00Z`);
	const endTime = Date.parse(`${endDate}T00:00:00Z`);
	const daysBetween = (endTime - startTime) / (1000 * 60 * 60 * 24);

	if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
		throw new Error('Choose a valid start date and end date.');
	}

	const today = getDateString(new Date());

	if (startDate < earliestApodDate || endDate < earliestApodDate || endDate > today) {
		throw new Error(`Choose APOD dates between ${earliestApodDate} and today.`);
	}

	if (daysBetween !== 8) {
		throw new Error('Choose dates exactly eight days apart to load nine consecutive days.');
	}
}

function createCard(item) {
	const card = document.createElement('button');
	card.className = 'card';
	card.type = 'button';
	card.setAttribute('aria-label', `Open ${item.title}, ${formatDate(item.date)}`);

	const media = document.createElement('span');
	media.className = 'card-media';

	if (item.media_type === 'image') {
		const image = document.createElement('img');
		image.src = item.url;
		image.alt = item.title;
		image.loading = 'lazy';
		media.appendChild(image);
	} else {
		const videoFallback = document.createElement('span');
		videoFallback.className = 'fallback';
		videoFallback.innerHTML = '<span><strong>VIDEO APOD</strong><small>Open to watch</small></span>';
		media.appendChild(videoFallback);

		const videoBadge = document.createElement('span');
		videoBadge.className = 'video-badge';
		videoBadge.textContent = '▶ VIDEO';
		media.appendChild(videoBadge);
	}

	const copy = document.createElement('span');
	copy.className = 'card-copy';

	const date = document.createElement('span');
	date.className = 'card-date';
	date.textContent = formatDate(item.date);

	const title = document.createElement('span');
	title.className = 'card-title';
	title.textContent = item.title;

	copy.appendChild(date);
	copy.appendChild(title);
	card.appendChild(media);
	card.appendChild(copy);
	card.addEventListener('click', function () {
		openDetails(item);
	});

	return card;
}

function displayGallery(items) {
	gallery.replaceChildren();

	for (let index = 0; index < items.length; index++) {
		gallery.appendChild(createCard(items[index]));
	}

	galleryStatus.textContent = `${items.length} days of discoveries`;
}

function openDetails(item) {
	modalMedia.replaceChildren();
	modalDate.textContent = formatDate(item.date);
	modalTitle.textContent = item.title;
	modalExplanation.textContent = item.explanation;

	if (item.copyright) {
		modalCredit.textContent = `Image credit: ${item.copyright}`;
		modalCredit.hidden = false;
	} else {
		modalCredit.hidden = true;
	}

	if (item.media_type === 'image') {
		const image = document.createElement('img');
		image.src = item.hdurl || item.url;
		image.alt = item.title;
		modalMedia.appendChild(image);
	} else {
		const videoLink = document.createElement('a');
		videoLink.className = 'video-link';
		videoLink.href = item.url;
		videoLink.target = '_blank';
		videoLink.rel = 'noopener noreferrer';
		videoLink.textContent = 'Watch this APOD video on its source site';
		modalMedia.appendChild(videoLink);
	}

	detailModal.showModal();
}

function getApiItems(data) {
	if (!Array.isArray(data)) {
		throw new Error('NASA returned an unexpected response. Please try again.');
	}

	if (data.length !== 9) {
		throw new Error(`NASA returned ${data.length} items instead of 9. Try another date range.`);
	}

	for (let index = 0; index < data.length; index++) {
		const item = data[index];
		const hasSupportedMedia = item.media_type === 'image' || item.media_type === 'video';

		if (!item.title || !item.date || !item.explanation || !item.url || !hasSupportedMedia) {
			throw new Error('NASA returned an incomplete gallery item. Please try again.');
		}
	}

	return data;
}

async function fetchGallery(event) {
	event.preventDefault();
	errorMessage.hidden = true;
	errorMessage.textContent = '';
	gallery.replaceChildren();
	galleryStatus.textContent = '';
	loadingMessage.hidden = false;
	const controller = new AbortController();
	const timeoutId = setTimeout(function () {
		controller.abort();
	}, 15000);

	try {
		const startDate = startDateInput.value;
		const endDate = endDateInput.value;
		const apiKey = apiKeyInput.value.trim();

		validateDateRange(startDate, endDate);

		if (!apiKey) {
			throw new Error('Enter a NASA API key. DEMO_KEY is available for testing.');
		}

		const apiUrl = new URL('https://api.nasa.gov/planetary/apod');
		apiUrl.searchParams.set('start_date', startDate);
		apiUrl.searchParams.set('end_date', endDate);
		apiUrl.searchParams.set('api_key', apiKey);

		const response = await fetch(apiUrl, { signal: controller.signal });
		const data = await response.json();

		if (!response.ok) {
			const message = data.msg || data.message || `NASA API request failed (${response.status}).`;
			throw new Error(message);
		}

		const items = getApiItems(data);
		displayGallery(items);
	} catch (error) {
		if (error.name === 'AbortError') {
			errorMessage.textContent = 'The NASA request timed out. Check your connection and try again.';
		} else {
			errorMessage.textContent = error.message || 'The gallery could not be loaded. Please try again.';
		}
		errorMessage.hidden = false;
		galleryStatus.textContent = 'Gallery could not be loaded';
	} finally {
		clearTimeout(timeoutId);
		loadingMessage.hidden = true;
	}
}

dateForm.addEventListener('submit', fetchGallery);
closeModalButton.addEventListener('click', function () {
	detailModal.close();
});
detailModal.addEventListener('click', function (event) {
	if (event.target === detailModal) {
		detailModal.close();
	}
});

setDefaultDates();
showRandomSpaceFact();
galleryStatus.textContent = 'Choose a date range, then select Get Space Images.';
