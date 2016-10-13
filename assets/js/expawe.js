// yeah this got spaghetti really quickly...
// if you have the time to fix it...
// please shoot me a pull request :)

var tooltipVal = 'sci',
	dataPast = [],
	dataFuture = [],
	dataParadigms = [],
	dataMilestones = [],
	count = 0;
	mcount = 0;
$(function() {
	//fadein when google font loaded
	WebFontConfig = {
		google: {
		 families: ['Unica One']
	 },
		active: function() {
			$('#sidebar, #page .container-fluid').stop().animate({
				opacity: 1
			}, {
        duration: 500,
        complete: function () {
					$('.loading').hide();
        }
      });
  	}
	};
	//get chart data
	$.getJSON('https://raw.githubusercontent.com/nathanwaters/expawe/master/data.json', function(activity) {
		//add awes
		$('<div class="col-md-6 col-lg-4"><div class="awe-mini" style="background-image:url(assets/img/awes/data.png)"><span>Got data? Help us out :D</span><a href="https://www.reddit.com/r/expawe" target="_blank"></a></div></div>').appendTo('#awes');
		$.each(activity.awes, function(i, awe) {
			var aweYear = awe[1] - new Date().getFullYear();
			$('<div class="col-md-6 col-lg-4"><div class="awe-mini" style="background-image:url(assets/img/awes/'+awe[3]+')"><span>'+awe[0]+'</span><a href="#'+awe[2]+'"><div class="awe-time"><span>'+aweYear.toString().replace(/^\d$/, '0$&')+'<small>YEARS</small></span></div></a></div></div>').appendTo('#awes');
		});
		$.each(activity.data, function(i, data) {
			var categoryId = 'cat-' + data.id;
			$('<li><a data-toggle="collapse" class="collapsed" href="#' +
				categoryId + '">' + data.category + '</a><ul id="' + categoryId +
				'" class="collapse"></ul></li>').appendTo('ul#sidebar-nav');
			$.each(data.charts, function(i, data) {
				$('<li><a href="#' + data.id + '" class="chart-nav" data-id="' +
					data.id + '" data-unit="' + data.past[0].unit + '" data-title="' + data.title +
					'" data-type="' + data.past[0].type + '"  data-count="' + data.past.length +
					'"><span class="check-chart glyphicon glyphicon-unchecked" aria-hidden="true"></span>' +
					data.title + '</a></li>').appendTo('ul#' + categoryId);

					dataSeries = [];

				if (data.past[0].data.length > 0) {
					//process past data
					dataPast[data.id] = {};
					$.each(data.past, function(i, past) {
						dataPast[data.id][past.name] = Highcharts.map(past.data, function(row) {
							return {
								x: new Date(row[0].replace(/-/g, "/")).getTime(), //.replace because fuck you Safari
								y: row[1],
								d: row[2],
								s: row[3],
								u: past.unit
							};
						});
						//push to series
						dataSeries.push({
							data: dataPast[data.id][past.name],
							id: past.name,
							name: past.name,
							type: past.type,
							color: Highcharts.getOptions().colors[count],
							fillOpacity: 0.3,
							turboThreshold: 0
						});
						count++;
					});

					count = count - data.past.length;
					//process future data
					if (data.future) {
						dataFuture[data.id] = {};
						$.each(data.future, function(i, future) {
							dataFuture[data.id][future.name] = Highcharts.map(future.data, function(row) {
								return {
									x: new Date(row[0].replace(/-/g, "/")).getTime(),
									y: row[1],
									d: row[2],
									s: row[3],
									u: future.unit
								};
							});
							//push to series
							dataSeries.push({
								data: dataFuture[data.id][future.name],
								id: future.name,
								name: future.name,
								type: 'spline',
								dashStyle: 'shortdash',
								color: Highcharts.getOptions().colors[count],
								linkedTo: future.name
							});
							count++;
						});
					}
			 }

				//process paradigms
				if (data.paradigms) {
					dataParadigms[data.id] = Highcharts.map(data.paradigms, function(
						row, i) {
						if (row[1] == "present") {
							endTime = new Date().getTime();
						}
						else {
							endTime = new Date(row[1].replace(/-/g, "/")).getTime();
						}
						if (i % 2 === 0) {
							paradigmColor = 'rgba(0,0,0,0.3)';
						}
						else {
							paradigmColor = 'rgba(0,0,0,0.6)';
						}
						return {
							color: paradigmColor,
							from: new Date(row[0].replace(/-/g, "/")).getTime(),
							to: endTime,
							label: {
								text: row[2],
								align: 'center',
								style: {
									color: 'rgba(255,255,255,0.2)',
									letterSpacing: 2
								}
							}
						}
					});
				}
				//process milestones
				if (data.milestones) {
					dataMilestones[data.id] = Highcharts.map(data.milestones, function(
						row) {
						return {
							color: '#ff50e9',
							dashStyle: 'dot',
							value: row[0],
							width: 1,
							label: {
								text: row[1],
								align: 'left',
								x: 0,
								style: {
									color: 'rgba(255,255,255,0.8)',
									fontStyle: 'italic'
								}
							},
							zIndex: 99
						}
					});
				}
				//process data soruces
				var dataSources = '';
				$.each(data.sources, function(i, source) {
					sourceNum = i + 1;
					dataSources += '<a href="' + source[1] + '" title="' + source[0] +
						'" target="_blank">[' + sourceNum + ']</a> ';
				});
				var dataSourcesFull = '';
				$.each(data.sources, function(i, source) {
					dataSourcesFull += '<a href="' + source[1] + '" target="_blank">[' + source[0] + ']</a> ';
				});
				var customSubtitle = '<ul class="subtitle"><li><a class="toggle-sub" href="#" data-toggle="tooltip" data-placement="right" title="VIEW SOURCES"><span class="glyphicon glyphicon-globe" aria-hidden="true"></span></a> <div class="toggle-sub-show"><span class="toggle-top mob-sub">' +
					data.desc + ' ' + dataSources + '</span><span class="toggle-bot">SOURCES: ' +
					dataSourcesFull +
					'</span></div></li>';
				if (data.future && data.past[0].data.length > 0) {
					customSubtitle += '<li><a class="toggle-sub" href="#" data-toggle="tooltip" data-placement="right" title="VIEW GROWTH"><span class="glyphicon glyphicon-time" aria-hidden="true"></span></a> <div class="toggle-sub-show"><span class="toggle-top">' +
					data.insight + '</span><span class="toggle-bot">' +
					data.growth + ' per year</span></div></li></ul>';
				} else {
					customSubtitle += '</ul>';
				}
				if (data.past.length === 1) { //remove legend if only one
					var legendBool = false;
				} else {
					var legendBool = true;
				}
				if (data.past[0].type == 'scatter') { //remove legend if only one
					var markerBool = true;
				} else {
					var markerBool = false;
				}
				$('<div id="' + data.id + '" class="chart">').appendTo('#container')
					.highcharts({
						chart: {
							spacingTop: 15,
							spacingBottom: 50,
							spacingLeft: 0,
							spacingRight: 0,
							zoomType: 'x',
							resetZoomButton: {
								position: {
									x: -10,
									y: 20
								},
								relativeTo: 'chart'
							},
							events: {
								tooltipRefresh: function(e) {
									$('.tooltip-' + tooltipVal).hide();
								}
							}
						},
						title: {
							text: data.title,
							align: 'left',
							x: 0,
							style: {
								fontSize: '24px',
								color: 'rgba(255,255,255,1)'
							}
						},
						subtitle: {
							text: customSubtitle,
							align: 'left',
							x: 0,
							style: {
								fontSize: '16px',
								color: 'rgba(255,255,255,0.7)'
							},
							useHTML: true
						},
						credits: {
							enabled: false
						},
						legend: {
							enabled: legendBool
						},
						plotOptions: {
		            series: {
		                marker: {
		                    enabled: markerBool
		                }
		            }
		        },
						xAxis: {
							crosshair: true,
							type: 'datetime',
							labels: {
								style: {
									fontSize: '14px'
								}
							},
							minTickInterval: 3600 * 24 * 30 * 1000,
							minRange: 3600 * 24 * 30 * 1000,
							dateTimeLabelFormats: { // don't display the dummy year
								month: '%b %Y',
								year: '%Y'
							},
							//plotBands: dataParadigms[data.id]
						},
						yAxis: {
							title: {
								text: null
							},
							labels: {
								enabled: false
							},
							gridLineWidth: 0,
							minorGridLineWidth: 0,
							minorTickLength: 0,
							tickLength: 0,
							//plotLines: dataMilestones[data.id]
						},
						tooltip: {
							borderWidth: 0,
							backgroundColor: "rgba(0,0,0,0.9)",
							headerFormat: '',
							style: {
								fontSize: '18px'
							},
							useHTML: true,
							formatter: function() {
								if (this.point.d) {
									tooltipDesc = '<span class="tooltip-desc">' + this.point.d +
										'</span>';
									if (this.point.s) {
										tooltipDesc = '<a href="' + this.point.s +
											'" target="_blank"><span class="tooltip-desc">' + this.point
											.d + '</span></a>';
									}
								} else if (data.past.length > 1) {
									tooltipDesc = '<span class="tooltip-desc">' + this.series.name +
										'</span>';
								}
								else {
									tooltipDesc = '';
								}
								if (this.y <= 1) {
									decVal = 5;
								}
								else if (this.y <= 1000) {
									decVal = 2;
								}
								else {
									decVal = 0;
								}
								var sciVal = this.y.toExponential(2).replace('+', '').replace(
									'e', '<small>x</small>10<sup>') + '</sup>';
								if (this.point.u[1] == "end") {
									if (this.y >= 999999999999999999999) { //limit in Highcharts processing
										return '<span class="tooltip-dec">' + sciVal.replace(
											 '<small>x</small>10<sup>0</sup>', '').replace(
												'<small>x</small>10<sup>1</sup>', '') + this.point.u[0] +
												'</span><span class="tooltip-sci">' + sciVal.replace(
												'<small>x</small>10<sup>0</sup>', '').replace(
												'<small>x</small>10<sup>1</sup>', '') + this.point.u[0] +
											'</span>' + tooltipDesc;
									} else {
										return '<span class="tooltip-dec">' + Highcharts.numberFormat(
												this.y, decVal, '.', ',') + this.point.u[0] +
											'</span><span class="tooltip-sci">' + sciVal.replace(
												'<small>x</small>10<sup>0</sup>', '').replace(
												'<small>x</small>10<sup>1</sup>', '') + this.point.u[0] +
											'</span>' + tooltipDesc;
									}
								} else if (this.point.u[1] == "start") {
									if (this.y >= 999999999999999999999) { //limit in Highcharts processing
										return '<span class="tooltip-dec">' + this.point.u[0] + sciVal.replace(
											 '<small>x</small>10<sup>0</sup>', '').replace(
												'<small>x</small>10<sup>1</sup>', '') +
												'</span><span class="tooltip-sci">' + this.point.u[0] + sciVal.replace(
												'<small>x</small>10<sup>0</sup>', '').replace(
												'<small>x</small>10<sup>1</sup>', '') +
											'</span>' + tooltipDesc;
									} else {
										return '<span class="tooltip-dec">' + this.point.u[0] + Highcharts.numberFormat(
												this.y, decVal, '.', ',') +
											'</span><span class="tooltip-sci">' + this.point.u[0] + sciVal.replace(
												'<small>x</small>10<sup>0</sup>', '').replace(
												'<small>x</small>10<sup>1</sup>', '') +
											'</span>' + tooltipDesc;
									}
								}
							}
						},
						series: dataSeries
					});
				if (data.past[0].data.length === 0) { //add missing data image
						$('#'+data.id).attr("style","background: url(assets/img/missing.png) no-repeat center;");
				}
			});
		});
		//adjust chart heights
		$('.chart:not("#combo")').height(0.6*$( window ).height());
		Highcharts.each(Highcharts.charts, function(chart) {
			chart.reflow();
		});
		//tooltip
		$('[data-toggle="tooltip"]').tooltip();
		//scroll to
		$('.sidebar-brand a').on('click', function(e) {
			e.preventDefault();
			$('#page').stop().animate({
				'scrollTop': 0
			}, 500);
			window.location.hash = '';
		});
		$('a[href^="#"].chart-nav, .awe-mini a[href^="#"]').on('click', function(e) {
			e.preventDefault();
			var target = this.hash,
				$target = $(target);
			$('#page').stop().animate({
				'scrollTop': $target.position().top
			}, 500, function() {
				window.location.hash = target;
			});
		}).children().click(function(e) {
			return false;
		});
		$('#page').bind('scroll',function(e){
			clearTimeout($.data(this, 'scrollTimer'));
			$.data(this, 'scrollTimer', setTimeout(function() {
				$('.chart').each(function(){
		        if ($(this).offset().top > window.pageYOffset + 70 && $(this).offset().top < window.pageYOffset + $(this).height() + 70) {
								history.pushState(null,null,'#'+$(this).attr('id'));
		        }
		    });
			}, 250));
		});
		//toggle subtitles
		$('.toggle-sub').click(function(e) {
			$('.toggle-sub').tooltip('destroy');
			e.preventDefault();
			var $desc = $(this).parent().find('.toggle-sub-show span.toggle-top');
			$desc.animate({
				top: parseInt($desc.css('top'), 10) == 0 ? -$desc.outerHeight() : 0
			});
			var $src = $(this).parent().find('.toggle-sub-show span.toggle-bot');
			$src.animate({
				top: parseInt($src.css('top'), 10) == 0 ? -$src.outerHeight() : 0
			});
		});
		//check chart toggle
		$(".check-chart").click(function() {
			var chartId = $(this).parent('.chart-nav').data('id');
			if (typeof dataPast[chartId] != 'undefined') {
				$(this).toggleClass("glyphicon-check glyphicon-unchecked");
				var chart = $('#combo').highcharts();
				var chartUnit = $(this).parent('.chart-nav').data('unit');
				var chartTitle = $(this).parent('.chart-nav').data('title');
				var chartType = $(this).parent('.chart-nav').data('type');
				var count = $(this).parent('.chart-nav').data('count');
				//add series data
				if ($(this).hasClass('glyphicon-check')) {
					$('.loading').show();
					var time = 0;
					var l = 1;
					$(this).parent('.chart-nav').addClass('chart-nav-selected');
						$.each(dataPast[chartId], function(key, past) {
							if (key == chartTitle) {
								var chartName = key;
							} else {
								chartName = key + ' [' + chartTitle + ']';
							}
							setTimeout(function(){
								chart.addSeries({
									data: past,
									id: chartId,
									name: chartName,
									type: chartType,
									color: Highcharts.getOptions().colors[mcount],
									fillOpacity: 0.3,
									turboThreshold: 0
								});
								if (dataFuture[chartId]) {
									chart.addSeries({
										data: dataFuture[chartId][key],
										id: chartId,
										name: chartName,
										type: 'spline',
										dashStyle: 'shortdash',
										color: Highcharts.getOptions().colors[mcount],
										linkedTo: past
									});
								}
								mcount++;
								if (l == count) $('.loading').hide();
								l++;
							}, time);
							time += 200;
						});

					chart.tooltip.options.formatter = function() {
						if (this.y <= 1) {
							decVal = 5;
						}
						else if (this.y <= 1000) {
							decVal = 2;
						}
						else {
							decVal = 0;
						}
						var unit = this.point.u;
						var sciVal = this.y.toExponential(2).replace('+', '').replace(
							'e', '<small>x</small>10<sup>') + '</sup>';
						if (unit[1] == "end") {
							if (this.y >= 999999999999999999999) { //limit in Highcharts processing
								return '<span class="tooltip-dec">' + sciVal.replace(
									 '<small>x</small>10<sup>0</sup>', '').replace(
										'<small>x</small>10<sup>1</sup>', '') + unit[0] +
										'</span><span class="tooltip-sci">' + sciVal.replace(
										'<small>x</small>10<sup>0</sup>', '').replace(
										'<small>x</small>10<sup>1</sup>', '') + unit[0] +
									'</span>' + '<span class="tooltip-desc">' + this.series.name +
									'</span>';
							} else {
								return '<span class="tooltip-dec">' + Highcharts.numberFormat(
										this.y, decVal, '.', ',') + unit[0] +
									'</span><span class="tooltip-sci">' + sciVal.replace(
										'<small>x</small>10<sup>0</sup>', '').replace(
										'<small>x</small>10<sup>1</sup>', '') + unit[0] +
									'</span>' + '<span class="tooltip-desc">' + this.series.name +
									'</span>';
							}
						} else if (unit[1] == "start") {
							if (this.y >= 999999999999999999999) { //limit in Highcharts processing
								return '<span class="tooltip-dec">' + unit[0] + sciVal.replace(
									 '<small>x</small>10<sup>0</sup>', '').replace(
										'<small>x</small>10<sup>1</sup>', '') +
										'</span><span class="tooltip-sci">' + unit[0] + sciVal.replace(
										'<small>x</small>10<sup>0</sup>', '').replace(
										'<small>x</small>10<sup>1</sup>', '') +
									'</span>' + '<span class="tooltip-desc">' + this.series.name +
									'</span>';
							} else {
								return '<span class="tooltip-dec">' + unit[0] + Highcharts.numberFormat(
										this.y, decVal, '.', ',') +
									'</span><span class="tooltip-sci">' + unit[0] + sciVal.replace(
										'<small>x</small>10<sup>0</sup>', '').replace(
										'<small>x</small>10<sup>1</sup>', '') +
									'</span>' + '<span class="tooltip-desc">' + this.series.name +
									'</span>';
							}
						}

					}
					$("#page").animate({
						scrollTop: 0
					}, "slow");
				}
				else { //remove series data
					$(this).parent('.chart-nav').removeClass('chart-nav-selected');
					if (typeof dataPast[chartId] != 'undefined') {
						var seriesLength = chart.series.length;
						for (var i = seriesLength - 1; i > -1; i--) {
							if (chart.series[i].options.id == chartId) chart.series[i].remove();
						}
					}
				}

			}
				//show or hide combined chart
				if ($('.chart-nav-selected').length == 0) {
					$('#combo').stop().animate({
						height: 0,
						opacity: 0
					}, 500);
				}
				else {
					$('#combo').height($(window).height() - 100);
					chart.reflow();
					$('#combo').stop().animate({
						opacity: 1
					}, 500);
				}
		});
	}).complete(function() {
		if (location.hash) {
			var target = location.hash;
			$('#page').delay(500).animate({
				'scrollTop': $(target).position().top
			}, 500);
		}
		$(
			'<div id="endofline"><a class="collapsed" href="https://www.reddit.com/r/expawe" target="_blank"><img src="assets/img/snoo.png"><p>Got data, ideas or issues?</p></a></div>'
		).appendTo('#container');
	});
	//random chart colors
	Highcharts.setOptions({
		colors: randomColor({
			luminosity: 'bright',
			count: 100
		})
	});
	//top-right sidebar toggle button
	$('#menu-toggle').click(function(e) {
		e.preventDefault();
		$('#sidebar, #page, #header').toggleClass('toggled');
		setTimeout(function() {
			Highcharts.each(Highcharts.charts, function(chart) {
				chart.reflow();
			});
		}, 500);
	});
	//window resize
	$(window).on('resize', function(event){
		setTimeout(function() {
			Highcharts.each(Highcharts.charts, function(chart) {
				chart.reflow();
			});
		}, 500);
	});
	//sidebar thin scrollbar design
	$('.scrollbar-exp').scrollbar();
	//toggle log or lin graph
	$('#toggle-log').change(function() {
		$('.loading').show();
		var time = 0;
		var l = Highcharts.charts.length;
		if ($(this).prop('checked')) {
			Highcharts.each(Highcharts.charts, function(chart) {
				setTimeout(function(){
					chart.yAxis[0].update({
						type: 'linear'
					});
				  if (chart.index === l - 1) $('.loading').hide(); //yeah this shit is messy, but it works
				}, time);
				time += 200;
			});
		}
		else {
			Highcharts.each(Highcharts.charts, function(chart) {
				setTimeout(function(){
					chart.yAxis[0].update({
						type: 'logarithmic'
					});
					if (chart.index === l - 1) $('.loading').hide();
				}, time);
				time += 200;
			});
		}
	});
	//toggle y-axis
	$('#toggle-y').change(function() {
		$('.loading').show();
		var time = 0;
		var l = Highcharts.charts.length;
		if ($(this).prop('checked')) {
			Highcharts.each(Highcharts.charts, function(chart) {
				setTimeout(function(){
					chart.yAxis[0].update({
						gridLineWidth: 0,
						labels: {
							enabled: false
						}
					});
					if (chart.index === l - 1) $('.loading').hide();
				}, time);
				time += 200;
			});
		}
		else {
			Highcharts.each(Highcharts.charts, function(chart) {
				setTimeout(function(){
					chart.yAxis[0].update({
						gridLineWidth: 0.2,
						labels: {
							enabled: true
						}
					});
					if (chart.index === l - 1) $('.loading').hide();
				}, time);
				time += 200;
			});
		}
	});
	//toggle points
	$('#toggle-points').change(function() {
		$('.loading').show();
		var time = 0;
		var l = Highcharts.charts.length;
		if ($(this).prop('checked')) {
			Highcharts.each(Highcharts.charts, function(chart) {
					setTimeout(function(){
						var x = chart.xAxis[0].plotLinesAndBands.length;
						if (x > 0) {
							while (x--) {
								chart.xAxis[0].plotLinesAndBands[x].destroy();
							}
						}
						var y = chart.yAxis[0].plotLinesAndBands.length;
						if (y > 0) {
							while (y--) {
								chart.yAxis[0].plotLinesAndBands[y].destroy();
							}
						}
						if (chart.index === l - 1) $('.loading').hide();
					}, time);
					time += 200;
			});
		}
		else {
			Highcharts.each(Highcharts.charts, function(chart) {
				setTimeout(function(){
					chart.xAxis[0].update({
						plotBands: dataParadigms[chart.renderTo.id]
					});
					chart.yAxis[0].update({
						plotLines: dataMilestones[chart.renderTo.id]
					});
					if (chart.index === l - 1) $('.loading').hide();
				}, time);
				time += 200;
			});
		}
	});
	//toggle scientific vs decimal notation
	$('#toggle-sci').change(function() {
		if ($(this).prop('checked')) {
			tooltipVal = 'sci';
		}
		else {
			tooltipVal = 'dec';
		}
	});
	//add combined chart to top
	$('<div id="combo" class="chart">').prependTo('#container').highcharts({
		chart: {
			spacingTop: 15,
			spacingBottom: 50,
			spacingLeft: 0,
			spacingRight: 0,
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -10,
					y: 20
				},
				relativeTo: 'chart'
			},
			events: {
				tooltipRefresh: function(e) {
					$('.tooltip-' + tooltipVal).hide();
				}
			}
		},
		title: {
			text: 'Mega Chart 9000',
			align: 'left',
			x: 0,
			style: {
				fontSize: '24px',
				color: 'rgba(255,255,255,1)'
			}
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: true
		},
		xAxis: {
			crosshair: true,
			type: 'datetime',
			labels: {
				style: {
					fontSize: '14px'
				}
			},
			minTickInterval: 3600 * 24 * 30 * 1000,
			minRange: 3600 * 24 * 30 * 1000,
			dateTimeLabelFormats: { // don't display the dummy year
				month: '%b %Y',
				year: '%Y'
			}
		},
		yAxis: {
			crosshair: true,
			title: {
				text: null
			},
			labels: {
				enabled: false
			},
			gridLineWidth: 0,
			minorGridLineWidth: 0,
			minorTickLength: 0,
			tickLength: 0
		},
		tooltip: {
			borderWidth: 0,
			backgroundColor: "rgba(0,0,0,0.9)",
			headerFormat: '',
			style: {
				fontSize: '18px'
			},
			useHTML: true
		}
	});
});
