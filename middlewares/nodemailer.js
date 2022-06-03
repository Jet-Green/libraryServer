const ejs = require('ejs');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const proviant = (request, response) => {

    const newValue = JSON.stringify(request.body);
    var order = request.body;
    var phone = order.delivery_info.phone.replace(/\D/g, '')
    phone[0] === "8" ? phone : phone[0] === "7" ? phone : phone = "8" + phone

    var html = ejs.render(`' <h1>Номер заказа: <%= order.number %> </h1>
                            <h3>Cумма заказа: <%= order.totalCost.toFixed(2) %></h3> 
                            <h1>Дата: <%= order.date %> </h1>
                            <h3>Время заказа: <%= order.time %></h3> 
                            <h3>Телефон: <%= phone %></h3>   
                            <h3>Адрес: <%= order.delivery_info.address %></h3> 
                            <h3>E-mail: <%= order.delivery_info.email %></h3> 
                            <h3>Комментарии: <%= order.delivery_info.commit %></h3>  
                             </br>   
                             <% if (order.cart.length) 
                             { %>    <table> 
                             <tr> <th>Код товара</th> <th>Наименование</th> <th>Ед. изм.</th> <th>Количество</th> <th>Примерная масса</th><th>Цена</th></tr>       
                             <% order.cart.forEach(function(product){ %>        
                            <tr> <td><%= product.index + "  " %></td>  <td><%= product.name + "  " %></td> <td><%= product.unit + "  " %></td>    <td><%= product.quantity + "  "%></td>  <td><%= product.approximateMass + "  "%></td> <td><%= product.price  + "  " %></td></tr> 
                             </br>        <% }) %>   
                              </table>       <% } %>'`, {
        order: order,
        phone: phone
    });

    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'grachevrv35@gmail.com',
            pass: process.env.PASS
        }
    }));

    var mailOptions = {
        from: 'grachevrv35@gmail.com',
        to: 'proviant-store@ya.ru',
        subject: 'Новый заказ[nodemailer]',

        html: `${html}`,
        attachments: [{
                filename: 'order.json',
                content: `${newValue}`
            },
            {
                filename: 'order.html',
                content: `${html}`
            }
        ],
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error);
        } else {
            response.send('OK')

        }
    });
}

const summer = (request, response) => {
    var order = request.body;
    var phone = order.phone.replace(/\D/g, '')
    phone[0] === "8" ? phone : phone[0] === "7" ? phone : phone = "8" + phone

    var html = ejs.render(`' 
                            <h3>ФИО: <%= order.name %></h3> 
                            <h3>Телефон: <%= phone %></h3>            
                            <h3>Курс: <%= order.course %></h3> 
                            <h3>Возраст: <%= order.age %></h3>  
                           `, {
        order: order,
        phone: phone
    });

    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'grachevrv35@gmail.com',
            pass: process.env.PASS
        }
    }));

    var mailOptions = {
        from: 'grachevrv35@gmail.com',
        to: 'grachevrv@ya.ru',
        subject: 'Запись Кубит',

        html: `${html}`,
        attachments: [

            {
                filename: 'order.html',
                content: `${html}`
            }
        ],
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error);
        } else {
            response.send('OK')

        }
    });
}
module.exports = {
    proviant,
    summer
}