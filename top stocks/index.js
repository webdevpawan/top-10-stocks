const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const ejs = require('ejs');
const nodemailer = require('nodemailer');


app.set('view engine', 'ejs');

const URL = 'https://www.hdfcsec.com/market/equity/top-gainer-nse?indicesCode=22115';

app.get("/", (req, res) => {
    axios.get(URL)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const list = $('div#marketTodaycompanyList');
            const stocks = list.find('div.companyList');

            const data = [];
            let count = 0;

            stocks.each((i, s) => {
                const company = $(s).find('span.cd-heading').text();
                const price = $(s).find('div.companyDetail').find('div.col-md-4');
                const ltp = $(price[0]).find('span.cd-val').text();
                const gain = $(price[1]).find('span.cd-val').text();
                const gain_per = $(price[2]).find('span.cd-val').text();
                const s_range = $(s).find('div.sliderDiv').find('div.row').find('div.col-md-4');
                const day_low = $(s_range[0]).find('span.cd-val').text();
                const day_high = $(s_range[2]).find('span.cd-val').text();
                const vol = $(s).find('div.volDiv').find('div.row').find('div.col-md-5').find('span.value').text();

                const row = { company, ltp, gain, gain_per, day_low, day_high, vol };
                data.push(row);
                count += 1;
                if (count >= 10) {
                    return false;
                }
            });
            res.render("index", { data });

            // sent email
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'abigayle82@ethereal.email',
                    pass: 'bVcqMY66rPQCUEQTSZ'
                }
            });

            ejs.renderFile('views/index.ejs', { data }, (err, html) => {
                if (err) {
                    console.log(err);
                } else {
                    const mailOptions = {
                        from: 'abigayle82@ethereal.email',
                        to: 'yoxzzadep@bugfoo.com',
                        subject: 'Top 10 Stocks',
                        html
                    };

                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            // console.log(info)
                        }
                    });
                }
            });

        })
        .catch(error => {
            console.error(error);
        });
});


app.listen(4000, () => {
    console.log('Server started on port 4000');
})
