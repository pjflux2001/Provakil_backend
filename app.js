// imports npm packages
var fs = require('fs'); 
var parse = require('csv-parse');
var chalk = require('chalk');

// checking for proper input format
if(process.argv.length != 4){
	console.log("\nTo execute the program, use the following command : ");
	console.log(chalk.green.bold.bgWhite("\n\tnode app.js") + " [" + chalk.yellow.bold.underline("/path/to/budget.csv") + "] [" + chalk.blue.bold.underline("/path/to/investments.csv") + "] \n");
	return ;
}

// check if file exists at the paths mentioned above
const path1 = process.argv[2], path2 = process.argv[3];

fs.access(path1, fs.F_OK, (err) => {
  if (err) {
    console.log(chalk.red.bold.bgWhite("budget.csv not found!!!"));
    process.exit(0);
  }
  //console.log(chalk.green.bold.bgWhite("budget.csv Loaded Successfully!"));
})

fs.access(path2, fs.F_OK, (err) => {
  if (err) {
    console.log(chalk.red.bold.bgWhite("investments.csv not found!!!"));
    process.exit(0);
  }
  //console.log(chalk.green.bold.bgWhite("investments.csv Loaded Successfully!"));
})


// variable to store csv data
var csvBudgetData=[];
var csvInvestmentData=[];

var timeLimit = {'Month' : -1, 'Year' : -1, 'Quarter' : -1};
var sectorLimit = {};
var fullLimit = {};

var index1 = 0;

// method to fetch data from budget csv
fs.createReadStream(process.argv[2])
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
        csvBudgetData.push(csvrow);
		
        if(index1 == 0) {

        } else if(csvrow[3] == '' && csvrow[2] != '') {
        	timeLimit[csvrow[2]] = csvrow[1];
        } else if(csvrow[2] == '' && csvrow[3] != '') {
        	sectorLimit[csvrow[3]] = csvrow[1];
        } else {
        	fullLimit[[csvrow[2],csvrow[3]]] = csvrow[1];
        }

		index1++;  
    })
    .on('end',function() {
    	// console.log();
    	// console.log("budget.csv : ")
     //  	console.log(timeLimit);
     //  	console.log(sectorLimit);
     //  	console.log(fullLimit);
     //  	console.log();
});

var year = {1 : {}, 
			2 : {},
			3 : {},
			4 : {},
			5 : {},
			6 : {},
			7 : {},
			8 : {},
			9 : {},
			10 : {},
			11 : {},
			12 : {}
		};

var timeline = {};
var index2 = 0;

var solution = [];

// method to fetch data from investment
fs.createReadStream(process.argv[3])
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
        csvInvestmentData.push(csvrow);
        index2++;
    })
    .on('end',function() {
    	// console.log("investments.csv : ")
     //  console.log(csvInvestmentData);
	}).on('end', function() {
			// time limits
			var monthLimit = timeLimit['Month'];
			var yearLimit = timeLimit['Year'];
			var quarterLimit = timeLimit['Quarter'];
			//console.log(monthLimit != -1 ? monthLimit : '',yearLimit != -1 ? yearLimit : '',quarterLimit != -1 ? quarterLimit : '');

			var i = 1;
			while(i < index2) {
				var stringDate = csvInvestmentData[i][1].split('/');
				var mydate = new Date(stringDate[2], stringDate[1]-1, stringDate[0]);
				var myyear = mydate.getFullYear();
				var mymonth = mydate.getMonth()+1;
				var myquarter = Math.ceil(mymonth/3)-1;

				if(timeline.hasOwnProperty(myyear) === false){
					timeline[myyear] = year;
				}
				if(timeline[myyear][mymonth].hasOwnProperty(csvInvestmentData[i][3]) === false){
					timeline[myyear][mymonth][csvInvestmentData[i][3]] = 0
				}

				// sector limit
				var mySector = csvInvestmentData[i][3];
				var mySectorLimit = sectorLimit[mySector];
				//if(mySectorLimit)
					//console.log(mySector,mySectorLimit);

				// full limit
				var myfulltime = '', myfullamount = ''
				for(var key5 in fullLimit) {
  					var value5 = fullLimit[key5];
  					if(key5.search(mySector) != -1) {
  						myfulltime = key5.split(',')[0];
  						myfullamount = value5;
  					} 
  			}

  			var isValid = true, fullSecTimeSpent = 0;
  			var yearlySpent = 0, monthlySpent = 0, quarterlySpent = 0;

  			for(var key in timeline) {
  				var value = timeline[key];
  				if(key.search(myyear) != -1) {
  					for(var key1 in timeline[myyear]){
  						var value1 = timeline[myyear][key1];
  						for(var key3 in timeline[myyear][key1]) {
  							var value3 = timeline[myyear][key1][key3];
  							yearlySpent += value3;
  							if(myfulltime == 'Year' && mySector == key3)
  									fullSecTimeSpent += value3
  						}
  						if(key1 == mymonth) {
  							for(var key2 in timeline[myyear][mymonth]) {
  								var value2 = timeline[myyear][mymonth][key2];
  								monthlySpent += value2;
  								if(myfulltime == 'Month' && mySector == key2)
  									fullSecTimeSpent += value2
  							}
  						}
  						if(Math.ceil(key1/3)-1 == myquarter) {
  							for(var key4 in timeline[myyear][key1]) {
  								var value4 = timeline[myyear][key1][key4];
  								quarterlySpent += value4;
  								if(myfulltime == 'Quarter' && mySector == key4)
  									fullSecTimeSpent += value4
  							}
  						}
  					}
  				}
  			}
  			//console.log(fullSecTimeSpent)

				// console.log(timeline);
				if((yearLimit == -1 || (yearlySpent + parseInt(csvInvestmentData[i][2]) <= yearLimit)) && (monthLimit == -1 || (monthlySpent + parseInt(csvInvestmentData[i][2]) <= monthLimit)) && (quarterLimit==-1 || (quarterlySpent + parseInt(csvInvestmentData[i][2]) <= quarterLimit)) && (!mySectorLimit || parseInt(csvInvestmentData[i][2]) <= mySectorLimit) && (fullSecTimeSpent <= myfullamount))
					timeline[myyear][mymonth][csvInvestmentData[i][3]] = parseInt(timeline[myyear][mymonth][csvInvestmentData[i][3]]) + parseInt(csvInvestmentData[i][2]);
				else
					solution.push(i);
				i++;
			}
			// console.log();
			// console.log("Solution : ")
			for(var ans in solution)
				console.log(solution[ans]);
	});



