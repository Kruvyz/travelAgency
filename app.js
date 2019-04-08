const express = require('express');
const app = express();
const sql = require('mssql');
const ejs = require('ejs');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");

const config = {
  user: 'sa',
  password: 'password',
  server: 'localhost',
  database: 'TravelAgency',
  port: 1433
}

app.get('/tables/:table', (req, res) => {
  const table = req.params.table;
  const id = table[table.length - 2] === 'e' && table[table.length - 3] === 'i' ?
  `${table.slice(0, table.length - 3)}yId` :
  `${table.slice(0, table.length - 1)}Id`;

  (async function () {
    try {
      let pool = await sql.connect(config);
      let result = await pool.request()
        .query(`select * from ${table}`);
          
      dataFormater(result.recordset);
      res.render('pages/tables.ejs', {title: table, data: result.recordset, id});   

      sql.close();
    } catch (err) {
      console.log(err);
    }
  })()
});

app.get('/enterQuery/:num', (req, res) => {
  const num = +req.params.num;
  const title = `Запит ${num}`;
  (async function () {
    try {
      let pool = await sql.connect(config);

      switch(num) {
        case 1: {
          let EmployeeExperience = await pool.request()
            .query(`select distinct EmployeeExperience from Employees`);
          
          let NumbersOfTours = await pool.request()
            .query(`select distinct NumbersOfTours from Employees`);
              
          res.render('pages/query1.ejs', {
            EmployeeExperience: EmployeeExperience.recordset,
            NumbersOfTours: NumbersOfTours.recordset,
            title
          });
          break;
        }

        case 2: {
          let ClientName = await pool.request()
            .query(`select distinct ClientName from Clients`);
          
          let PurchasePrice = await pool.request()
            .query(`select distinct PurchasePrice from SalesForm`);
              
          res.render('pages/query2.ejs', {
            ClientName: ClientName.recordset,
            PurchasePrice: PurchasePrice.recordset,
            title
          });
          break;
        }

        case 3: {
          let TourPrice = await pool.request()
            .query(`select distinct TourPrice  from Tours`);
              
          res.render('pages/query3.ejs', {
            TourPrice: TourPrice.recordset,
            title
          });
          break;
        }

        case 4: {
          let Category  = await pool.request()
            .query(`select distinct Category from Hotels`);
          
          let CountryName = await pool.request()
            .query(`select distinct CountryName from Countries`);
              
          res.render('pages/query4.ejs', {
            Category : Category.recordset,
            CountryName: CountryName.recordset,
            title
          });
          break;
        }

        case 5: {
          let ClientName  = await pool.request()
            .query(`select distinct ClientName from Clients`);
          
          let EmployeeName = await pool.request()
            .query(`select distinct EmployeeName from Employees`);
              
          res.render('pages/query5.ejs', {
            ClientName : ClientName.recordset,
            EmployeeName: EmployeeName.recordset,
            title
          });
          break;
        }

        case 6: {
          let HotelName  = await pool.request()
            .query(`select distinct HotelName from Hotels`);
              
          res.render('pages/query6.ejs', {
            HotelName: HotelName.recordset,
            title
          });
          break;
        }

        case 7: {
          let HotelName = await pool.request()
            .query(`select distinct HotelName from Hotels`);
          
          let EmployeeName = await pool.request()
            .query(`select distinct EmployeeName from Employees`);

          let CountryName = await pool.request()
            .query(`select distinct CountryName from Countries`);
              
          res.render('pages/query7.ejs', {
            HotelName: HotelName.recordset,
            EmployeeName: EmployeeName.recordset,
            CountryName: CountryName.recordset,
            title
          });
          break;
        }

        case 8: {
          let TourPrice = await pool.request()
            .query(`select distinct TourPrice from Tours`);
          
          let City = await pool.request()
            .query(`select distinct City from Tours`);

          res.render('pages/query8.ejs', {
            TourPrice: TourPrice.recordset,
            City: City.recordset,
            title
          });
          break;
        }

        case 9: {
          let Category  = await pool.request()
            .query(`select distinct Category from Hotels`);
          
          let CountryName = await pool.request()
            .query(`select distinct CountryName from Countries`);

          let HotelPrice = await pool.request()
            .query(`select distinct HotelPrice from Hotels`);
              
          res.render('pages/query9.ejs', {
            Category : Category.recordset,
            CountryName: CountryName.recordset,
            HotelPrice: HotelPrice.recordset,
            title
          });
          break;
        }
      }
      
      sql.close();
    } catch (err) {
      console.log(err);
    }
  })()
});

app.post('/query/:num', (req, res) => {
  const num = +req.params.num;
  
  (async function () {
    try {
      let pool = await sql.connect(config);
      let result;
      
      switch(num) {
        case 1: {          
          const exp = +req.body.experience;
          const num = +req.body.number;

          result = await pool.request()
          .query(`
            Select EmployeeName, EmployeePosition
            From Employees
            Where EmployeeExperience=${exp} and NumbersOfTours=${num}`);
          break;
        }

        case 2: {
          const price = +req.body.price;
          const client = req.body.client;

          result = await pool.request()
          .query(`
            Select (PurchasePrice - DiscountPrice) As 'Discount'
            From SalesForm
            Left Join Clients
            On SalesForm.ClientId = Clients.ClientId
            Where  PurchasePrice > ${price} 
            and ClientName Like '%${client}%'`);
            break;
        }

        case 3: {
          const startDate = (new Date(req.body.startDate)).toLocaleDateString();
          const endDate = (new Date(req.body.endDate)).toLocaleDateString();
          const price = +req.body.price;

          result = await pool.request()
          .query(`
            Select CountryName, Capital, Currency, Countries.Language 
            From Countries
            Right Join Tours
            On Countries.CountryId = Tours.CountryId
            Where DepartureDate Between '${startDate}' and '${endDate}'
            and TourPrice > ${price}`);
            break;
        }

        case 4: {
          const category = req.body.category;
          const сountry = req.body.сountry;

          result = await pool.request()
            .query(`
              Select HotelName, City, HotelPrice
              From Hotels
              Left Join Countries
              On Hotels.CountryId = Countries.CountryId
              Where Category Like '%${category}%' and CountryName Like '${сountry}'
            `);
            break;
        }

        case 5: {
          const client = req.body.client;
          const employee = req.body.employee;

          result = await pool.request()
            .query(`
              Select FormId, DateOfSale, TourId, SalesForm.NumbersOfTours, PurchasePrice, Discount, DiscountPrice
              From SalesForm
              Left Join Clients
              On SalesForm.ClientId = Clients.ClientId
              Left Join Employees
              On SalesForm.EmployeeId = Employees.EmployeeId
              Where Clients.ClientName Like '%${client}%' 
              and Employees.EmployeeName Like '%${employee}%'
            `);
            break;
        }

        case 6: {
          const hotel = req.body.hotel;
          const numberDays = +req.body.numberDays;

          result = await pool.request()
            .query(`
              Select (HotelPrice * ${numberDays}) as '3агальнa вартість проживання'
              From Hotels
              Where HotelName Like '%${hotel}%'
            `);
            break;
        }

        case 7: {
          const hotel = req.body.hotel;
          const employee = req.body.employee;
          const country = req.body.country;

          result = await pool.request()
            .query(`
              Select Clients.ClientName, Clients.ClientAddress, Clients.TelephoneNumber
              From SalesForm
                Left Join Clients
                On SalesForm.ClientId = Clients.ClientId
                Left Join Employees
                On Employees.EmployeeId = SalesForm.EmployeeId
              Where CountryName Like '%${country}%'
              and Employees.EmployeeName Like '%${employee}%' 
              and HotelName Like '%${hotel}%'          
            `);
          break;
        }

        case 8: {
          const city = req.body.city;
          const minPrice = +req.body.minPrice;
          const maxPrice = +req.body.maxPrice;

          result = await pool.request()
            .query(`
              Select TourId, City, DepartureDate, ArrivalDate, NumbersOfDays, TourPrice
              From Tours
              where City =
              (Select  City
              Where TourPrice Between '${minPrice}' and '${maxPrice}')
              and City Like '%${city}%'
            `);
          break;
        }

        case 9: {
          const category = req.body.category;
          const сountry = req.body.сountry;
          const hotelPrice = +req.body.hotelPrice;

          result = await pool.request()
            .query(`
              Select HotelName, City
              From Hotels
              Left Join Countries
              On Hotels.CountryId = Countries.CountryId
              Where Category Like '%${category}%' 
              and CountryName Like '${сountry}'
              and HotelPrice >= ${hotelPrice}
            `);
            break;
        }
      }      
        
      dataFormater(result.recordset);
      res.render('pages/result.ejs', {title: `Запит ${num}`, data: result.recordset});   

      sql.close();
    } catch (err) {
      console.log(err);
    }
  })()
});

app.post('/insert/:table', (req, res) => {
  const body = req.body;
  const table = req.params.table;
  let row = [];
  let values = [];

  for (item in body) {
    if (body[item] === '') continue;
    values.push(`'${body[item]}'`);
    row.push(item);
  }
 
  (async function () {
    try {
      let pool = await sql.connect(config);
      await pool.request()
        .query(`insert into ${table} (${row}) values (${values})`);

      res.redirect(`/tables/${req.params.table}`);

      sql.close(); 
    } catch (err) {
      console.log(err);
    }
  })()
});

app.post('/delete/:id', (req, res) => {
  const id = +req.params.id;
  const idName = req.body.idName;
  const tableName = req.body.tableName;

  (async function () {
    try {
      let pool = await sql.connect(config);
      await pool.request()
        .query(`delete from ${tableName} where ${idName}=${id}`);

      res.redirect(`/tables/${tableName}`);

      sql.close(); 
    } catch (err) {
      console.log(err);
    }
  })()

});

app.get('/', (req, res) => {
  res.render('pages/home.ejs');
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

function dataFormater(arr) {
  for (let i in arr) {
    for (let j in arr[i]) {
      if (j.includes('Date') || j.includes('date'))
        arr[i][j] = arr[i][j].toLocaleDateString();
    }
  }
}
