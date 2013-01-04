$.cookie.json = true;
var data = {
	q1: {yes: 0, no: 0},
	q2: {yes: 0, no: 0}
};
var people = 0;

google.load("visualization", "1", {packages:["corechart"]});
function drawChart() {
	// Q1
	draw('chart-q1', data.q1, ['#009944', '#69c629']);
	
	// Q2
	draw('chart-q2', data.q2, ['#eb5c00', '#c8161d']);
}

function draw(domId, answer, sliceColors) {
	var fontSizeYes = 22;
	var fontSizeNo = 22;

	var yes = answer.yes;
	var no = answer.no;
	var data = google.visualization.arrayToDataTable([
		['Task', 'Hours per Day'],
		['YES!「賛成です。」', yes],
		['NO!「反対です。」', no]
	]);

	if(yes > no) {
		fontSizeYes = 28;
	} else if(yes < no) {
		fontSizeNo = 28;
	}

	var options = {
			chartArea: {
			width: '90%',
			height: '90%'
		},
		slices: [
			{color: sliceColors[0], textStyle: {fontSize: fontSizeYes}},
			{color: sliceColors[1], textStyle: {fontSize: fontSizeNo}}
		],
		legend: {
			position: 'none'
		}
	};

	var chart = new google.visualization.PieChart(document.getElementById(domId));
	chart.draw(data, options);
}
var voteCount = 0;
function vote() {
	if(typeof q1 != 'undefined' && typeof q2 != 'undefined') {
		voteCount++;
		$.ajax({
			type: 'post',
			url: './vote.php?' + parseInt((new Date)/1000),
			data: {
				q1: q1,
				q2: q2
			},
			success: function() {
				var data = {
					q1: q1,
					q2: q2,
					sended: true
				};
				$.cookie('enquate2', data, {expires:365});
				$('#result-default').hide();
				$('#result-complete').show();
			},
			error: function() {
				if(voteCount < 10) {
					vote();
				}
			}
		});
	}
}

var q1, q2, sended;
$(function() {
	$.getJSON('enquate.json', function(json) {
		if(json) {
			data.q1.yes = json.q1.a1;
			data.q1.no = json.q1.a2;
			data.q2.yes = json.q2.a1;
			data.q2.no = json.q2.a2;
			people = json.q1.a1 + json.q1.a2;
		}
		$('#main span.count').text(people);
		$('#q1-yes span.count').text(data.q1.yes);
		$('#q1-no span.count').text(data.q1.no);
		$('#q2-yes span.count').text(data.q2.yes);
		$('#q2-no span.count').text(data.q2.no);
		drawChart();
	});
	if($.cookie('enquate2')) {
		var enquate = $.cookie('enquate2');
		q1 = enquate.q1;
		q2 = enquate.q2;
		sended = enquate.sended ? enquate.sended : false;
		
		if(sended) {
			if(q1 == 'a1') {
				$('#btn-q1-no a').hide();
			} else {
				$('#btn-q1-yes a').hide();
			}
			if(q2 == 'a1') {
				$('#btn-q2-no a').hide();
			} else {
				$('#btn-q2-yes a').hide();
			}
			$('#result-default').hide();
			$('#result-complete').show();
		}
	}
	
	if(sended != true) {
		$('#question .btn a').click(function() {
			if(typeof q1 == 'undefined' && typeof q2 == 'undefined') {
				people++;
				$('#main span.count').text(people);
			}
		});

		$('#btn-q1-yes a').one('click', function() {
			q1 = 'a1';
			$('#btn-q1-no a').hide();
			data.q1.yes++;
			$('#q1-yes span.count').text(data.q1.yes);
			draw('chart-q1', data.q1, ['#009944', '#69c629']);
			vote();
		});
		$('#btn-q1-no a').one('click', function() {
			q1 = 'a2';
			$('#btn-q1-yes a').hide();
			data.q1.no++;
			$('#q1-no span.count').text(data.q1.no);
			draw('chart-q1', data.q1, ['#009944', '#69c629']);
			vote();
		});

		$('#btn-q2-yes a').one('click', function() {
			q2 = 'a1';
			$('#btn-q2-no a').hide();
			data.q2.yes++;
			$('#q2-yes span.count').text(data.q2.yes);
			draw('chart-q2', data.q2, ['#eb5c00', '#c8161d']);
			vote();
		});
		$('#btn-q2-no a').one('click', function() {
			q2 = 'a2';
			$('#btn-q2-yes a').hide();
			data.q2.no++;
			$('#q2-no span.count').text(data.q2.no);
			draw('chart-q2', data.q2, ['#eb5c00', '#c8161d']);
			vote();
		});
	}
	$('#question .btn a, #btn-result a').hover(function() {
		$(this).find('img').css('opacity', 0.8);
	}, function() {
		$(this).find('img').css('opacity', '');
	});

	$('#btn-result a').click(function() {
		$("html:not(:animated), body:not(:animated)").animate({scrollTop:$('#result-q1').offset().top - 10}, 500);
	});
})
