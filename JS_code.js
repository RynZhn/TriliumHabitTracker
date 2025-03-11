const monthStrings = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

async function getChartData() {
    // pull data
    const data = await api.runOnBackend(() => {
        
        //get all date notes
        const notes = api.getNotesWithLabel('dateNote');
        const data = [];   
        
        for (const note of notes) {
            //get the date of the note [YYYY-MM-DD] string format
            const date = note.getLabelValue('dateNote');
            
            //Grab all the habits to track
            const stretched = (note.getLabelValue('Stretched'));            
            const readNews = (note.getLabelValue('ReadNews'));
            const gym = (note.getLabelValue('Gym'));
            const duoLingo = (note.getLabelValue('DuoLingo'));
            const budget = (note.getLabelValue('Budget'));
            
            
            const [year,month,day] = date.split("-");
            // only grab data from 2025
            if (year === '2025') {
                const habits = {stretched,readNews,gym,duoLingo,budget};
                data.push({date,habits});
                
               
        
            }
            
        }
        //data.sort((a, b) => a.date > b.date ? 1 : -1);
        // return the data
        
        return data;
        
        
    });
    const dataset = {}
    // create the struct for each month
    monthStrings.forEach((m) => eval(`dataset.${m}Struct = {}`));

    //populate each month struct with the habits
    monthStrings.forEach((m) => eval(`dataset.${m}Struct.day=[]`));
    monthStrings.forEach((m) => eval(`dataset.${m}Struct.Stretched=[]`));
    monthStrings.forEach((m) => eval(`dataset.${m}Struct.ReadNews=[]`));
    monthStrings.forEach((m) => eval(`dataset.${m}Struct.Gym=[]`));
    monthStrings.forEach((m) => eval(`dataset.${m}Struct.DuoLingo=[]`));
    monthStrings.forEach((m) => eval(`dataset.${m}Struct.Budget=[]`));
    
    // push data to the structs that were just created
    for (const datapoint of data){
        const [year,month,day] = datapoint.date.split("-");
        const monthString = monthStrings[parseInt(month)-1];

        eval(`dataset.${monthString}Struct.day.push(parseInt(day))`); 
        eval(`dataset.${monthString}Struct.Stretched.push(datapoint.habits.stretched)`); 
        eval(`dataset.${monthString}Struct.ReadNews.push(datapoint.habits.readNews)`);
        eval(`dataset.${monthString}Struct.Gym.push(datapoint.habits.gym)`);
        eval(`dataset.${monthString}Struct.DuoLingo.push(datapoint.habits.duoLingo)`);
        eval(`dataset.${monthString}Struct.Budget.push(datapoint.habits.budget)`);
    
    
    }
    return dataset;
    
    
} //end of getChartData()



const habitData = await getChartData();


//////////////////// Generate the table /////////////////////////////
const habits = ['Stretched','ReadNews','Gym','DuoLingo','Budget'];
const daysList = [...Array(31).keys()].map(item=>item+1);
const tableHeader = `<tr><th>Month</th><th>Habit</th>${daysList.reduce((memo,entry) => {
    memo += `<th>${entry.toString()}</th>`; return memo;
},'')}</tr>`;
var tableBody = '';

for (const month of monthStrings){
    
    //create structure to hold the rows
    const rows = habits.map(()=>{return '<tr>'});

    //first row needs to include month-cell which spans 2 rows'
    rows[0] += `<td rowspan=5>${month}</td>`;
    //add the habits to each row
    for (var i = 0; i< habits.length; i++){
       rows[i] += `<td>${habits[i]}</td>`;
    }

    //add the habits to each cell
    for (const day of daysList){

        //add habit cells
        const dayIndex = eval(`habitData.${month}Struct.day.indexOf(day)`);
        if (dayIndex >= 0){ //day exists; add the habits to the chart
            rows.forEach((value,index)=> rows[index] +=`<td><div class=${eval(`habitData.
${month}Struct.${habits[index]}[dayIndex]`)}></div></td>`);

        }else{ //entry does not exist, assume i didnt do any of the habits
            rows.forEach((value,index) => rows[index] += "<td><div class='false'></div></td>");
        }

    }

    // end row for each row
    rows.forEach((value,index) => rows[index] += '</tr>');
    tableBody+= rows.reduce((memo,entry)=>{
        memo += entry;return memo
    },'');
}   
    

//grab the table in the parent note
const tableContainer = document.getElementById('container');

//send the table data to the actual HTML note
const table = `<table>${tableHeader}${tableBody}</table>`;
tableContainer.innerHTML = table;
