var config = {
	apiKey: "AIzaSyAiBVssorhP_WIhTzw9Qh5b9vDAzYFL2dA",
	authDomain: "cc-filter-and-search-poc.firebaseapp.com",
	databaseURL: "https://cc-filter-and-search-poc.firebaseio.com",
	projectId: "cc-filter-and-search-poc",
	storageBucket: "",
	messagingSenderId: "836289872646"
};
firebase.initializeApp(config);

$("#menu-toggle").click(function(e) {
	e.preventDefault();
	$("#wrapper").toggleClass("toggled");
});


$(document).ready(function() {
	loadCards();
});

var cardArray; 
var cardTable = $('#resultsTable').DataTable();

function loadCards() {
	
	var cardsRef = firebase.database().ref('ccMatrix');
	cardsRef.on('value', function(data) {
		cardArray = data.val();
		console.log(cardArray);
		populateCards();
	});
}

function populateCards() {
	cardTable.clear().draw();
	setUpFilters();
	for (cardName in cardArray) {
		card = cardArray[cardName]
		if(filterCard(card)) {
			addCardToTable(card);
		}
	}
	cardTable.draw();
}

function addCardToTable (card) {
	var cardName = card.cardName;
	var rewardsRate, signupBonus;
	var cardImgPath = 'https://via.placeholder.com/200x125';
	var cardValue = 0;
	if(card.extras) {
		var pointValue = 0.01
		cardImgPath = card.extras.imgUrl || 'https://ck-content.imgix.net/res/content/creditcards/'+card.extras.partnerName+'/'+card.contentID.toLowerCase()+'_big.png?w=200&auto=compress';
		var maxRewardsRate = Math.max(card.extras.other.rewardsRate, card.extras.groceries.rewardsRate || 0, card.extras.gas.rewardsRate || 0, card.extras.restaurants.rewardsRate || 0, card.extras.travel.rewardsRate || 0)
		if(maxRewardsRate > card.extras.other.rewardsRate) {
			rewardsRate = "Up to " + maxRewardsRate;
		} else {
			rewardsRate = card.extras.other.rewardsRate;
		}
		signupBonus = card.extras.signupBonus.bonus * pointValue;
		var bonusEarned = 0;
		if(Number($('#totalSpend').text()) > card.extras.signupBonus.threshold/(card.extras.signupBonus.timing || 1)) {
			bonusEarned = card.extras.signupBonus.bonus;
		}
		var yearsWithCard = parseFloat($('input[type=radio][name=timeWithCard]:checked').parent().text());
		var gasPoints = Math.min($("#gasSpend").val(),card.extras.gas.maxSpend/(card.extras.gas.maxReset||1))*card.extras.gas.rewardsRate + ($("#gasSpend").val() - Math.min($("#gasSpend").val(),card.extras.gas.maxSpend/(card.extras.gas.maxReset||1)))*card.extras.other.rewardsRate;
		var groceryPoints = Math.min($("#grocerySpend").val(),card.extras.groceries.maxSpend/(card.extras.groceries.maxReset||1))*card.extras.groceries.rewardsRate + ($("#grocerySpend").val() - Math.min($("#grocerySpend").val(),card.extras.groceries.maxSpend/(card.extras.groceries.maxReset||1)))*card.extras.other.rewardsRate;
		var travelPoints = Math.min($("#travelSpend").val(),card.extras.travel.maxSpend/(card.extras.travel.maxReset||1))*card.extras.travel.rewardsRate + ($("#travelSpend").val() - Math.min($("#travelSpend").val(),card.extras.travel.maxSpend/(card.extras.travel.maxReset||1)))*card.extras.other.rewardsRate;
		var otherPoints = Math.min($("#otherSpend").val(),card.extras.other.maxSpend/(card.extras.other.maxReset||1))*card.extras.other.rewardsRate + ($("#otherSpend").val() - Math.min($("#otherSpend").val(),card.extras.other.maxSpend/(card.extras.other.maxReset||1)))*card.extras.other.rewardsRate;
		var restaurantPoints = Math.min($("#restaurantSpend").val(),card.extras.restaurants.maxSpend/(card.extras.restaurants.maxReset||1))*card.extras.restaurants.rewardsRate + ($("#restaurantSpend").val() - Math.min($("#restaurantSpend").val(),card.extras.restaurants.maxSpend/(card.extras.restaurants.maxReset||1)))*card.extras.other.rewardsRate;
		var pointsEarned = bonusEarned + yearsWithCard * 12 * (gasPoints + groceryPoints + travelPoints + otherPoints + restaurantPoints);
		cardValue = pointsEarned * pointValue - (yearsWithCard - 1) * card.extras.fees.annual - card.extras.fees.annualIntro;
	} else {
		rewardsRate = 0;
		signupBonus = 0;
	}
	//console.log(cardName);
	cardTable.row.add($('<tr>').append($('<td>').append($("<img src='"+cardImgPath+"' class='cardImg'></img>"))).append($('<td>').text(cardName)).append($('<td>').text(rewardsRate)).append($('<td>').text(signupBonus)).append($('<td>').text(cardValue)));
	//$("#resultsTableBody").append($('<tr>').append($('<td>').append($("<img src='"+cardImgPath+"' class='cardImg'></img>"))).append($('<td>').text(cardName)).append($('<td>').text(rewardsRate)).append($('<td>').text(signupBonus)).append($('<td>').text(cardValue)));
}

$("#travelSpend").slider({
	ticks: [0, 500, 1000, 1500, 2000],
	ticks_labels: ['$0', '$500', '$1,000', '$1,500', '$2,000'],
	ticks_snap_bounds: 100,
	value: 200,
});
$("#restaurantSpend").slider({
	ticks: [0, 500, 1000, 1500, 2000],
	ticks_labels: ['$0', '$500', '$1,000', '$1,500', '$2,000'],
	ticks_snap_bounds: 100,
	value: 200,
});
$("#grocerySpend").slider({
	ticks: [0, 500, 1000, 1500, 2000],
	ticks_labels: ['$0', '$500', '$1,000', '$1,500', '$2,000'],
	ticks_snap_bounds: 100,
	value: 300,
});
$("#gasSpend").slider({
	ticks: [0, 500, 1000, 1500, 2000],
	ticks_labels: ['$0', '$500', '$1,000', '$1,500', '$2,000'],
	ticks_snap_bounds: 100,
	value: 100,
});
$("#otherSpend").slider({
	ticks: [0, 500, 1000, 1500, 2000],
	ticks_labels: ['$0', '$500', '$1,000', '$1,500', '$2,000'],
	ticks_snap_bounds: 100,
	value: 500,
});
$('#otherSpend, #gasSpend, #grocerySpend, #restaurantSpend, #travelSpend').on('change', function() {
	//console.log($('#travelSpend').val());
	$('#totalSpend').text(Number($("#travelSpend").val())+Number($("#restaurantSpend").val())+Number($("#grocerySpend").val())+Number($("#gasSpend").val())+Number($("#otherSpend").val()));
});

var acceptedNetworks;
var acceptedIssuers;

function setUpFilters () {
	acceptedNetworks = [];
	acceptedIssuers = [];
	$(".networkCheckbox").not("#anyNetwork").each(function() {
		if($(this).prop('checked')) {
			acceptedNetworks.push($(this).attr('network'));
		};
	});
	$(".issuerCheckbox").not("#anyissuer").each(function() {
		if($(this).prop('checked')) {
			acceptedIssuers.push($(this).attr('issuer'));
		};
	});
	//console.log(acceptedNetworks);
}

function filterCard (card) {
	if (!card.extras) {
		return false;
	}
	//Rewards type exclusions
	if(((!card.extras || card.extras.rewardsCurrency === "") && !($('#noRewards').prop('checked'))) 
		|| (card.extras && (card.extras.rewardsCurrency === "cash") && !($('#cashRewards').prop('checked')))
		|| (card.extras && (card.extras.rewardsCurrency && card.extras.rewardsCurrency !== "cash") && !($('#pointRewards').prop('checked')))) {
		// console.log(!card.extras);
	return false;
}
	//Fees exclusions
	if(($('#noAnnualFee').prop('checked') && (!card.extras || card.extras.fees.annual === "" || card.extras.fees.annual > 0))
		|| ($('#noForeignTransactionFee').prop('checked') && (!card.extras || card.extras.fees.hasForeign || card.extras.fees.hasForeign === "" ))) {
		return false;
}
	//Network exclusion
	if(!($('#anyNetwork').prop('checked')) && (!card.extras || !(acceptedNetworks.indexOf(card.extras.network)>=0))) {
		return false;
	}
	//Issuer exclusion
	if(!($('#anyIssuer').prop('checked')) && (!card.extras || !(acceptedIssuers.indexOf(card.extras.partnerName)>=0))) {
		return false;
	}
	return true;
}

$("#anyIssuer").on('change', function() {
	$('.issuerCheckbox').not(this).prop('checked', this.checked);
});

$("#repopulate").on('click', function() {
	populateCards();
});

$("#anyNetwork").on('change', function() {
	$('.networkCheckbox').not(this).prop('checked', this.checked);
});

$(".networkCheckbox").on('change', function() {
	switch ($('.networkCheckbox:checked').not("#anyNetwork").length) {
		case ($('.networkCheckbox').not("#anyNetwork").length):
		$('#anyNetwork').prop('indeterminate', false);
		$('#anyNetwork').prop('checked', true);
		break;
		case 0:
		$('#anyNetwork').prop('indeterminate', false);
		$('#anyNetwork').prop('checked', false);
		break;
		default: 
		$('#anyNetwork').prop('indeterminate', true);
		$('#anyNetwork').prop('checked', false);
		break;
	}
});

$(".issuerCheckbox").on('change', function() {
	switch ($('.issuerCheckbox:checked').not("#anyIssuer").length) {
		case ($('.issuerCheckbox').not("#anyIssuer").length):
		$('#anyIssuer').prop('indeterminate', false);
		$('#anyIssuer').prop('checked', true);
		break;
		case 0:
		$('#anyIssuer').prop('indeterminate', false);
		$('#anyIssuer').prop('checked', false);
		break;
		default: 
		$('#anyIssuer').prop('indeterminate', true);
		$('#anyIssuer').prop('checked', false);
		break;
	}
});