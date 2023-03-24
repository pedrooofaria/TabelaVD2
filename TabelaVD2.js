/*globals define*/
define( ["qlik", "jquery", "text!./style.css"], function ( qlik, $, cssContent ) {
	'use strict';
	$( "<style>" ).html( cssContent ).appendTo( "head" );
	
	function createRows ( rows, dimensionInfo ) {
		var html = "",
			controw = 1;

		rows.forEach( function ( row ) {
			html += '<tr>';
			row.forEach( function ( cell, key ) {
				if ( cell.qIsOtherCell ) {
					cell.qText = dimensionInfo[key].othersLabel;
				}
				
				html += "<td ";
				if ( key !== 0 ) {
					if( controw % 2 !== 0 ) {
						html += "class='numeric-branco'";
					} else {
						html += "class='numeric-cinza'";
					}
				} else {
					if( controw % 2 !== 0 ) {
						html += "class='string-branco'";
					} else {
						html += "class='string-cinza'";
					}
				}
				if ((key==3)||(key==6)||(key==9)||(key==10)) {
					if( parseFloat(cell.qText) < 0 ) {
						html += " style='color: red;'";
					} else {
						html += " style='color: green;'";
					}
				}
				
				html += '>' + cell.qText + '</td>';
				
			} );
			controw = controw+1;
			html += '</tr>';
		} );
		return html;
	}

	return {
		initialProperties: {
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 18,
					qHeight: 90
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1
				},
				measures: {
					uses: "measures",
					min: 1
				},
				sorting: {
					uses: "sorting"
				},
				settings: {
					uses: "settings"
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ( $element, layout ) {
			var html = "<table><thead><tr>", self = this,
				morebutton = false,
				hypercube = layout.qHyperCube,
				rowcount = hypercube.qDataPages[0].qMatrix.length,
				colcount = hypercube.qDimensionInfo.length + hypercube.qMeasureInfo.length,
				contcol = 1;
			
			//render TITULO 1	
			hypercube.qDimensionInfo.forEach( function ( cell ) {
				html += '<th class="dep"></th>';
			} );
			hypercube.qMeasureInfo.forEach( function ( cell ) {
				switch (contcol) {
				  case 1:
					html += '<th colspan="3" class="ven"><h3>VENDA</h3></th>';
					contcol=contcol+1;
					break;
				  case 2:
				  	contcol=contcol+1;
					break;
				  case 3:
					contcol=contcol+1;
					break;
				  case 4:
					html += '<th colspan="3" class="ton"><h3>TONS</h3></th>';
					contcol=contcol+1;
					break;
				  case 5:
				  	contcol=contcol+1;
					break;
				  case 6:
				  	contcol=contcol+1;
					break;
				  /*case 7:
				  	html += '<th colspan="3" class="mc"><h3>MC %</h3></th>';
					contcol=contcol+1;
					break;
				  case 8:
				  	contcol=contcol+1;
					break;
				  case 9:
				  	contcol=contcol+1;
					break;*/
				  case 7:
					html += '<th colspan="2" class="cob"><h3>COBERTURA</h3></th>';
					contcol=contcol+1;
					break;
				  case 8:
				  	contcol=contcol+1;
					break;
				  case 9:
					html += '<th colspan="2" class="cob"><h3>CRESCIMENTO</h3></th>';
					contcol=contcol+1;
					break;
				  case 10:
					contcol=contcol+1;
					break;
				  case 11:
					html += '<th colspan="1" class="cob"><h3>BASE</h3></th>';
					contcol=contcol+1;
					break;
				}
			} );
			html += "</tr>";
			//render TITULO 2
			html += "<tr>";
			hypercube.qDimensionInfo.forEach( function ( cell ) {
				html += '<th class="dep">' + cell.qFallbackTitle + '</th>';
			} );
			contcol = 1;
			hypercube.qMeasureInfo.forEach( function ( cell ) {
				if((contcol==1)||(contcol==2)||(contcol==3)) {
				  html += '<th class="ven">' + cell.qFallbackTitle + '</th>';
				  contcol=contcol+1;
				} else
				  if(contcol==4 || contcol==5 || contcol==6) {
				  html += '<th class="ton">' + cell.qFallbackTitle + '</th>';
				  contcol=contcol+1;
				/*} else
				  if(contcol==7 || contcol==8 || contcol==9) {
				  html += '<th class="mc">' + cell.qFallbackTitle + '</th>';
				  contcol=contcol+1;*/
				} else
				  if(contcol==7 || contcol==8 || contcol==9 || contcol==10 || contcol==11) {
				  html += '<th class="cob">' + cell.qFallbackTitle + '</th>';
				  contcol=contcol+1;
				}
			} );
			html += "</tr>";
			//render TOTAL
			html += "<tr>";
			html += '<th class="titulo-total"> Totais </th>';
			contcol = 1;
			hypercube.qGrandTotalRow.forEach( function ( cell ) {
				html += '<th';
				if ((contcol==3)||(contcol==6)||(contcol==9)||(contcol==10)) {
					if( parseFloat(cell.qText) < 0 ) {
						html += " style='color: red;'";
					} else {
						html += " style='color: green;'";
					}
				}
				html += ' class="total">' + cell.qText + '</th>';
				contcol=contcol+1;
			} );
			html += "</tr></thead><tbody>";
			//render DADOS
			html += createRows( hypercube.qDataPages[0].qMatrix, hypercube.qDimensionInfo );
			html += "</tbody></table>";
			//add 'more...' button
			if ( hypercube.qSize.qcy > rowcount ) {
				html += "<button class='more'>More...</button>";
				morebutton = true;
			}
			$element.html( html );
			if ( morebutton ) {
				$element.find( ".more" ).on( "click", function () {
					var requestPage = [{
						qTop: rowcount,
						qLeft: 0,
						qWidth: colcount,
						qHeight: Math.min( 50, hypercube.qSize.qcy - rowcount )
					}];
					self.backendApi.getData( requestPage ).then( function ( dataPages ) {
						rowcount += dataPages[0].qMatrix.length;
						if ( rowcount >= hypercube.qSize.qcy ) {
							$element.find( ".more" ).hide();
						}
						var html = createRows( dataPages[0].qMatrix, hypercube.qDimensionInfo );
						$element.find( "tbody" ).append( html );
					} );
				} );
			}
			console.log(layout);
			return qlik.Promise.resolve();
		}
	};
} );
