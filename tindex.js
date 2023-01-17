const VER = "v1.4.2";

const Discord = require("discord.js");
const bot = new Discord.Client({intents: ["GUILDS","GUILD_MESSAGES","GUILD_MESSAGE_REACTIONS","DIRECT_MESSAGES"]}, {allowedMentions:{parse:['users','roles'], repliedUser:true}});
const settings = require("./settings.json");
const roles = require("./reminders/roles.json");
const pingch = require("./reminders/channels/static.json");
const kroky = require("./kroky.json");
const Fs = require('fs');
const moment = require("moment");

const reminders = "./reminders/";
const studentspath = "./reminders/students/";
const channelspath = "./reminders/channels/";
const sentpath = "./reminders/sent/";

const kokdniprejposlepingzateste = 14; //ne spreminjat ker nevem več kaj to nrdi

let timeCheck = 0;

bot.on("ready", async () => {
	console.log('ONLINE!');
	bot.user.setActivity(VER, {type:"PLAYING"});
	setInterval(() => {
		bot.user.setActivity(VER, {type:"PLAYING"});
	},600000);
	
	let d = new Date(/*1634680800000*/);
	let timestamp = d.getTime();
	let dayNameLong = sloDnevi(d.getDay(),0);
	let dayNameShort = sloDnevi(d.getDay(),1);
	let day = d.getDate();
	let month = d.getMonth()+1;
	let year = d.getFullYear();
	let monthNameLong = sloMeseci(month-1,0);
	let monthNameShort = sloMeseci(month-1,1);
	let hour = d.getHours();
	let minute = d.getMinutes();
	let second = d.getSeconds();
	console.log("[" + timestamp + "] " + "Danes je " + dayNameLong + " (" + dayNameShort + ")" + ", " + day + "." + month + "." + year + ", ura je " + hour + ":" + minute + ":" + second + ", mesec je pa " + monthNameLong + " (" + monthNameShort + ")");
	
	
	//await loadtesti("E4C");
	await sorttesti("E4C");
	await loadStudent("E4C");
	await checkExpiredTesti("E4C");
	await sleep(500);
	console.log(testi);
	
	await sendPing("E4C");
	
	//await sleep(1000);
	
	await updateMSG("E4C");
	
	await sendKroky("E4C");

	setTimeout(() => {
		timeCheck = 1;
	}, 120000); //120000
	setInterval(async() => {
		if(timeCheck === 1) {
			var nowTime = moment().locale('sl').format('LTS');
			var hoursTime = nowTime.split(':')[0];
			var minutesTime = nowTime.split(':')[1];
			var secondsTime = nowTime.split(':')[2];
						
			//bot.channels.cache.get('646056538061930516').send(nowTime);
			if(hoursTime == '0' && minutesTime == '00' && secondsTime.startsWith('0')) {
				console.log('Time = ' + nowTime, 'sl');
				//bot.channels.get('635740179386335243').send('Bot reset at ' + nowTime);
				await sleep(1000);
				process.exit();
			}
		}
	}, 5000);
	console.log('Ready!');
});


bot.on("messageCreate", async message => {
	if(message.author.bot) return;
	let kostan = aJeToKostan(message);
	let mod = aJeToMod(message);
	//message.channel.send(mod.toString() + "");
	let msgc = message.content.toLowerCase();
	if(!msgc.startsWith(settings.prefix)) return;
	
	let cmd = msgc.slice(settings.prefix.length).toString().split(" ")[0].toString();
	let args = msgc.slice(settings.prefix.length).toString().slice(+cmd.length+1).toString();
	let argsa = msgc.slice(settings.prefix.length).toString().slice(+cmd.length+1).toString().split(" ");
	
	if(cmd == "dtt") {
		let timestempilka = checkDateToTimestamp(args);
		message.reply("" + timestempilka);
	}
	if(cmd == "cas") {
		let timestempilka = checkDateToTimestamp(args);
		if(!isNaN(timestempilka)) {
			let razlikacasa = timeDifference(new Date(timestempilka), new Date());
			message.reply("" + razlikacasa);
		} else {
			message.reply("" + timestempilka);
		}
	}
	
	if(cmd == "uhutest") {
		message.channel.send("<@&" + roles.endan + ">");
		console.log(roles.endan);
		/*
		let txtraw = "";
		await Fs.readFile(__dirname + "\\test.txt", 'utf8', function(err, data) {
		  if (err) throw err;
		  txtraw = data;
		});
		await sleep(100);
		let txt = Fs.readFileSync(reminders + "E4C.txt").toString().split("\r\n");
		message.channel.send(txt);
		//console.log(role);
		*/
	}
	
	if(cmd == "am" && kostan) {
		if(!args) {
			let as = await addStudent("E4C",message.author.id);
			if(as) {
				message.channel.send(as);
				console.log(as + "(" + message.author.id + ")");
			} else {
				message.channel.send("Uspešno dodan.");
				console.log("student add: " + message.author.id);
			}
		} else {
			if(isNaN(args)) {
				message.channel.send("Napaka: userID");
				console.log("args == nan" + "(" + args + ")");
			} else {
				let rs = await addStudent("E4C",args);
				if(rs) {
					message.channel.send(rs);
					console.log(rs + "(" + args + ")");
				} else {
					message.channel.send("Uspešno dodan.");
					console.log("student add: " + args);
				}
			}
			
		}
	}
	if(cmd == "rm" && kostan) {
		if(!args) {
			let as = await removeStudent("E4C",message.author.id);
			if(as) {
				message.channel.send(as);
				console.log(as + "(" + message.author.id + ")");
			} else {
				message.channel.send("Uspešno odstranjen.");
				console.log("student remove: " + message.author.id);
			}
		} else {
			if(isNaN(args)) {
				message.channel.send("Napaka: userID");
				console.log("args == nan" + "(" + args + ")");
			} else {
				let rs = await removeStudent("E4C",args);
				if(rs) {
					message.channel.send(rs);
					console.log(rs + "(" + args + ")");
				} else {
					message.channel.send("Uspešno odstranjen.");
					console.log("student remove: " + args);
				}
			}
			
		}
	}
	
	
	if(cmd == "at" && mod) {
		if(args && argsa && argsa.length > 1) {
			let timestempilka = await checkDateToTimestamp(argsa[1].toString());
			if(!isNaN(timestempilka)) {
				if(timestempilka > new Date().getTime() - 86400000) {
					let predmetmoment = argsa[0].toString();
					if(isNaN(predmetmoment)) {
						predmetmoment = predmetmoment.toUpperCase();
						let opismoment = " ";
						let msgopis = args.split('"');
						if(msgopis[1]) { //če je biu dodan opis
							let opp = msgopis[1].toString();
							if(!opp.includes("\n") && !opp.includes(":") && opp.length <= 200) { //opis check
								opismoment = opp;
								if(!testi.includes(predmetmoment + ":" + timestempilka)) { //preverjanje testa
									if(!testi.toString().includes(""+timestempilka)) { //prever timestamp(več testov na dan)
										await addtest("E4C",predmetmoment,timestempilka,opismoment);
										//let listek = await makeTestList("E4C");
										message.reply("Uspešno dodan!\nPredmet: " + predmetmoment + "\tdatum: " + argsa[1].toString() + "\t opis: " + opismoment);
										console.log("test add: " + predmetmoment + ":" + timestempilka + ":" + opismoment + " by USER: " + message.author.tag + "(" + message.author.id + ")");
										updateMSG("E4C");
									} else { //na isti dan že, zbere nov timestamp
										console.log("opa! prej:");
										console.log(timestempilka);
										while(testi.toString().includes(timestempilka)) { //dokler je tak timestamp dodaja +1, da ma usak drgacnga, po 1 ms več..
											timestempilka = +timestempilka + 1;
											await sleep(50);
										}
										await sleep(100);
										console.log("pol:");
										console.log(timestempilka);
										//pol nadaljudje normalno
										await addtest("E4C",predmetmoment,timestempilka,opismoment);
										//let listek = await makeTestList("E4C");
										message.reply("Uspešno dodan!\nPredmet: " + predmetmoment + "\tdatum: " + argsa[1].toString() + "\t opis: " + opismoment);
										console.log("test add: " + predmetmoment + ":" + timestempilka + ":" + opismoment + " by USER: " + message.author.tag + "(" + message.author.id + ")");
										updateMSG("E4C");
									}
								} else {
									message.reply("Tak test že obstaja");
								}
							} else {
								message.reply("Neveljaven opis! (ne sme vsebovati ':', do 200 znakov)");
							}
						} else {
							if(!testi.includes(predmetmoment + ":" + timestempilka)) { //preverjanje testa
								if(!testi.toString().includes(""+timestempilka)) { //preverjanje timestap(več testov na dan)
									await addtest("E4C",predmetmoment,timestempilka,opismoment);
									//let listek = await makeTestList("E4C");
									message.reply("Uspešno dodan!\nPredmet: " + predmetmoment + "\tdatum: " + argsa[1].toString());
									console.log("test add: " + predmetmoment + ":" + timestempilka + " by USER: " + message.author.tag + "(" + message.author.id + ")");
									updateMSG("E4C");
								} else { //na isti dan že, zbere nov timestamp
									console.log("opa! prej:");
									console.log(timestempilka);
									while(testi.toString().includes(timestempilka)) { //dokler je tak timestamp dodaja +1, da ma usak drgacnga, po 1 ms več..
										timestempilka = +timestempilka + 1;
										await sleep(50);
									}
									await sleep(100);
									console.log("pol:");
									console.log(timestempilka);
									//pol nadaljudje normalno
									await addtest("E4C",predmetmoment,timestempilka,opismoment);
									//let listek = await makeTestList("E4C");
									message.reply("Uspešno dodan!\nPredmet: " + predmetmoment + "\tdatum: " + argsa[1].toString());
									console.log("test add: " + predmetmoment + ":" + timestempilka + " by USER: " + message.author.tag + "(" + message.author.id + ")");
									updateMSG("E4C");
								}
							} else {
								message.reply("Tak test že obstaja");
							}
						}
					} else {
						message.reply("Napaka predmeta");
					}
				} else {
					message.reply("Napaka časa");
				}
				
			} else {
				message.reply("Napaka pretvorbe datuma: " + timestempilka);
			}
		} else {
			message.reply("Napaka! Uporaba: " + settings.prefix + "at [predmet] [datum]");
		}
		
	}
	
	if(cmd == "rt" && mod) {
		if(args && argsa && argsa.length > 1) {
			let timestempilka = checkDateToTimestamp(argsa[1].toString());
			if(!isNaN(timestempilka)) {
				if(timestempilka > 1 /*new Date().getTime()*/) {
					let predmetmoment = argsa[0].toString();
					if(isNaN(predmetmoment)) {
						predmetmoment = predmetmoment.toUpperCase();
						let ofcheck = 0; //kolkrat je povečal
						console.log("opa remove! ");
						while(!testi.toString().includes(predmetmoment + ":" + timestempilka) && ofcheck < 11) { //dokler ne najde in pooveča do vkl 10krat
							timestempilka++;
							ofcheck++;
						}
						if(ofcheck < 11) { //najdu 
							await removetest("E4C",predmetmoment,timestempilka);
							//let listek = await makeTestList("E4C");
							message.reply("Uspešno odstranjen!\nPredmet: " + predmetmoment + "\tdatum: " + argsa[1].toString());
							console.log("test remove: " + predmetmoment + ":" + timestempilka + " by USER: " + message.author.tag + "(" + message.author.id + ")");
							updateMSG("E4C");
						} else {
							message.reply("Tak test ne obstaja!");
						}
					} else {
						message.reply("Napaka predmeta");
					}
				} else {
					message.reply("Napaka časa");
				}
				
			} else {
				message.reply("napaka ut: " + timestempilka);
			}
		} else {
			message.reply("Napaka! Uporaba: " + settings.prefix + "rt [predmet] [datum]");
		}
	}
	
	if(cmd == "lt" && kostan) {
		let listek = await makeTestList("E4C");
		message.channel.send(listek);
	}
	if(cmd == "ltd" && kostan) {
		let xdnitesti = await getxdnitesti("E4C");
		message.channel.send(xdnitesti);
	}
	
	if(cmd == "update" && kostan) {
		updateMSG("E4C");
		message.reply("Posodobljeno.");
	}
	
	if(cmd == "sp" && kostan) {
		let pingpong = await sendPing("E4C");
		if(pingpong) message.reply("" + pingpong);
		message.channel.send("poslano");
	}
	
	if(cmd == "s" && kostan) {
		let ide = "";
		console.log("set request by USER: " + message.author.tag + "(" + message.author.id + ")");
		message.channel.send("Seznam testov - nastavlanje...")
			.then(async sent => {
				ide = sent.id;
				let cccid = message.channel.id;
				let napakca = await addChannel(cccid, ide, "E4C");
				if(napakca) {
					message.channel.messages.fetch({around: ide, limit: 1})
						.then(msg => {
							const fetchedMsg = msg.first();
							if(fetchedMsg.author.id == bot.user.id) {
								fetchedMsg.edit("Napaka: " + napakca);
							}
						});
				} else {
					console.log("set request by USER: " + message.author.tag + "(" + message.author.id + ") uspešen: cccid=" + cccid + ", ide=" + ide);
				}
				await sleep(500);
				updateMSG("E4C");
			});
		
	}
});


const dnevizaping = [1,2,3,4,5,7,10,14];
let obvestila = [
	[], //1
	[], //2
	[], //3
	[], //4
	[], //5
	[], //7
	[], //10
	[], //14
]
async function sendPing(razred) {
	console.log("sendping");
	
	let treuntnicas = new Date();
	let trenutnidan = treuntnicas.getDate();
	let trenutnimesec = treuntnicas.getMonth()+1;
	let trenutnoleto = treuntnicas.getFullYear();
	let trenutnidatum = trenutnidan + "." + trenutnimesec + "." + trenutnoleto;
	
	let zadnjidatum = await Fs.readFileSync(sentpath + razred + ".txt").toString();
	
	if(zadnjidatum.includes(trenutnidatum)) {
		console.log("zadnjidatum ma trenutni datum, konec.");
		return;
	}
	console.log("sp...");
	//return;
	let pingmomenti = [];
	testi.forEach(async tetest => {
		if(tetest) {
			let t = tetest.split(":");
			let opistesta = " ";
			if(t[2] != " ") opistesta = "[" + t[2].toString() + "]";
			let imepredmeta = tetest.split(":")[0].toString();
			let timepredmeta = Math.floor(tetest.split(":")[1]);
			let dp = new Date(timepredmeta);
			let difo = await timeDifference(dp, new Date());
			let cezkolkdni = 0;
			let day = dp.getDate();
			let month = dp.getMonth()+1;
			let year = dp.getFullYear();
			let output = imepredmeta + ": " + day + "." + month + "." + year + "\t<t:" + Math.floor(timepredmeta/1000) + ":R>\t" + opistesta + "\n";
			if(difo.includes("days") && dp > new Date()) {cezkolkdni = Math.floor(difo.split(" ")[0]);} else {cezkolkdni = 42;}
			if(cezkolkdni <= kokdniprejposlepingzateste) {
				dnevizaping.forEach(dan => {
					if(cezkolkdni == dan) obvestila[dnevizaping.indexOf(dan)].push(output);
				});
				//obvestila[obvestila.length -1].push(output);
			}
		}
	});
	await sleep(500);
	console.log("obvestila");
	//console.log(obvestila);
	let pingchannel = await bot.channels.cache.get(pingch.obvestila);
	if(obvestila.toString().includes(":")) {
		let msg = "**Obvestilo za prihodnje teste:**\n\n";
		
		pingchannel.send(msg);
	
		var i = 0;
		for(i = 0; i<obvestila.length;i++) {
			if(obvestila[i].toString()) {
				if(dnevizaping[i] == 1) {
					pingchannel.send("<@&" + roles.endan + "> Testi čez [" + dnevizaping[i] + "] dni:\n" + obvestila[i].join("\n").toString());
				} else if(dnevizaping[i] == 2) {
					pingchannel.send("<@&" + roles.dvadni + "> Testi čez [" + dnevizaping[i] + "] dni:\n" + obvestila[i].join("\n").toString());
				} else if(dnevizaping[i] == 3) {
					pingchannel.send("<@&" + roles.tridni + "> Testi čez [" + dnevizaping[i] + "] dni:\n" + obvestila[i].join("\n").toString());
				} else if(dnevizaping[i] == 4) {
					pingchannel.send("<@&" + roles.stiridni + "> Testi čez [" + dnevizaping[i] + "] dni:\n" + obvestila[i].join("\n").toString());
				} else if(dnevizaping[i] == 5) {
					pingchannel.send("<@&" + roles.petdni + "> Testi čez [" + dnevizaping[i] + "] dni:\n" + obvestila[i].join("\n").toString());
				} else if(dnevizaping[i] == 7) {
					pingchannel.send("<@&" + roles.sedemdni + "> Testi čez [" + dnevizaping[i] + "] dni:\n" + obvestila[i].join("\n").toString());
				} else if(dnevizaping[i] == 10) {
					pingchannel.send("<@&" + roles.desetdni + "> Testi čez [" + dnevizaping[i] + "] dni:\n" + obvestila[i].join("\n").toString());
				} else if(dnevizaping[i] == 14) {
					pingchannel.send("<@&" + roles.stirinajstdni + "> Testi čez [" + dnevizaping[i] + "] dni:\n" + obvestila[i].join("\n").toString());
				}
				
				//console.log("i="+i+"\tdan="+dnevizaping[i]);
				//console.log(obvestila[i]);
			}
		}
	}
	await sleep(500);
	
	await Fs.writeFile(sentpath + razred + ".txt", trenutnidatum, async function (err) {
		if (err) throw err;
	});
}

async function getxdnitesti(razred) { //opisi testov
	console.log("getxdnitesti moment");
	let pinglist = [];
	let check = 0;
	let pingmsg = "**Testi v naslednjih " + kokdniprejposlepingzateste + " dneh:**\n\n";
	testi.forEach(async tetest => {
		if(tetest) {
			let t = tetest.split(":");
			let imepredmeta = t[0].toString();
			let timepredmeta = Math.floor(t[1]);
			let opistesta = " ";
			if(t[2] != " ") opistesta = "[" + t[2].toString() + "]";
			let dp = new Date(timepredmeta);
			let difo = await timeDifference(dp, new Date());
			let cezkolkdni = 0;
			if(difo.includes("days")) {cezkolkdni = Math.floor(difo.split(" ")[0]);} else {cezkolkdni = 42;}
			let day = dp.getDate();
			let month = dp.getMonth()+1;
			let year = dp.getFullYear();
			//await sleep(100);
			//console.log("preverjam za test: " + imepredmeta + ": " + day + "." + month + "." + year + "\t" + cezkolkdni + "\t" + difo);
			if(/*!sentlist.includes(tetest) && */cezkolkdni <= kokdniprejposlepingzateste) {
				//if(!sentlist.includes(tetest)) check++;
				await pinglist.push(tetest);
				pingmsg += imepredmeta + ": " + day + "." + month + "." + year + "\t<t:" + Math.floor(timepredmeta/1000) + ":R>\t" + opistesta + "\n";
				//console.log("opozorilo za test: " + imepredmeta + ": " + day + "." + month + "." + year + "\t" + cezkolkdni + "\t" + difo);
			}
		}
	});
	await sleep(1000);
	console.log(pinglist);
	/*
	await Fs.appendFile(sentpath + razred + ".txt", pinglist.join("\r\n"), function (err) {
		if (err) throw err;
	});
	*/
	if(pinglist.length > 0/* && check != 0*/) {return pingmsg;} else {return;}
	
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = Math.abs(current - previous);
	
    /*if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours';   
    }

    else*/ if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years';   
    }
}

async function addChannel(chID, msgID, razred) {
	if(!testichannels.includes(chID)) {
		await Fs.appendFile(channelspath + razred + ".txt", "\r\n" + chID + ":" + msgID, function (err) {
			if (err) throw err;
		});
		await loadTestiChannels(razred);
	} else {
		return "ta kanal  je bil že nastavljen!";
	}
}
function sloDnevi (dantedna,dolzina) {
	let dnevi = ["Nedelja","Ponedeljek","Torek","Sreda","Četrtek","Petek","Sobota"];
	if(dolzina) {
		return dnevi[dantedna].slice(0,3).toString();
	} else {
		return dnevi[dantedna].toString();
	}
}
function sloMeseci(mesecleta,dolzina) {
	let meseci = ["Januar","Februar","Marec","April","Maj","Junij","Julij","August","September","Oktober","November","December"];
	if(dolzina) {
		return meseci[mesecleta].slice(0,3).toString();
	} else {
		return meseci[mesecleta].toString();
	}
}

let testi = [];
async function loadtesti(razred) {
	//console.log("loadtesti()");
	let rawtesti = Fs.readFileSync(reminders + razred + ".txt").toString().split("\r\n");
	testi = [];
	rawtesti.forEach(tet => {
		if(tet) testi.push(tet);
	});
}
/*
let sentlist = [];
async function loadsent(razred) {
	let rawsent;
	await Fs.readFile(sentpath + razred + ".txt", 'utf8', function(err, data) {
	  if (err) throw err;
	  rawsent = data.toString().split("\r\n");
	  sentlist = [];
	  rawsent.forEach(st => {
		  if(st) sentlist.push(st);
	  });
	  //console.log(sentlist);
	});
}
*/
async function addtest(razred,predmet,time,opis) {
	//console.log("addtest()");
	if(time && razred && predmet && opis) {
		if(!isNaN(time)) {
			await Fs.appendFile(reminders + razred + ".txt", "\r\n" + predmet + ":" + time + ":" + opis, async function (err) {
			  if (err) throw err;
			  await sorttesti(razred);
			  await sleep(500);
			});
		} else {
			return "Napaka: 160";
		}
	} else {
		return "Napaka: 163";
	}
}
async function removetest(razred,predmet,time) {
	console.log("remove test()");
	if(razred && predmet && time) {
		loadtesti(razred);
		if(!isNaN(time)) {
			let test = predmet + ":" + time;
			//console.log("test=" + test);
			let testistring = testi.toString();
			if(testistring.includes(test)) {
				let testindexremove = /*testi.indexOf(test);*/-1;
				testi.forEach(tere => {
					if(tere) {
						if(tere.toString().startsWith(test)) testindexremove = testi.indexOf(tere);
					}
				});
				//console.log("testindexremove="+  testindexremove);
				testi[testindexremove] = "-";
				let novitesti = [];
				testi.forEach(teste => {
					if(teste) {
						if(teste != "-") {
							novitesti.push(teste);
						}
					}
				});
				//console.log("novitesti=");
				//console.log(novitesti);
				
				await Fs.writeFile(reminders + razred + ".txt", novitesti.join("\r\n"), async function (err) {
					if (err) throw err;
					await sorttesti(razred);
				});
			} else {
				return "Test ne obstja";
			}
		} else {
			return "Napaka: 195";
		}
	} else {
		return "Napaka: 196";
	}
}
async function sorttesti(razred) {
	//console.log("sort testi()");
	await loadtesti(razred);
	await sleep(500);
	let testiPredmet = [];
	let opisiPredmet = [];
	let testiTime = [];
	let sortedTestiTime = [];
	testi.forEach(tetest => {
		if(tetest) {
			let tt = tetest.split(":");
			let imepredmeta = tt[0].toString();
			let timepredmeta = tt[1].toString();
			let opispredmeta = " ";
			if(tt[2]) opispredmeta = tt[2].toString();
			testiPredmet.push(imepredmeta);
			testiTime.push(timepredmeta);
			sortedTestiTime.push(timepredmeta);
			opisiPredmet.push(opispredmeta);
		}
	});
	//let sortedTestiTime = testiTime;
	sortedTestiTime.sort(function(a, b) {
	  return a - b;
	});
	let sortedTesti = [];
	sortedTestiTime.forEach(testtime => {
		if(testtime) {
			let sortpredmet = testiPredmet[testiTime.indexOf(testtime)];
			let sortopis = opisiPredmet[testiTime.indexOf(testtime)];
			
			sortedTesti.push(sortpredmet + ":" + testtime + ":" + sortopis);
		}
	});
	
	await Fs.writeFile(reminders + razred + ".txt", sortedTesti.join("\r\n"), function (err) {
		if (err) throw err;
	});
	await sleep(500);
	testi = sortedTesti;
	
}
let students = [];
async function loadStudent(razred) {
	//console.log("loadstudent()");
	let rawStudent = Fs.readFileSync(studentspath + razred + ".txt").toString().split("\r\n");
    students = [];
	rawStudent.forEach(sutu => {
		if(sutu) students.push(sutu);
	});
}
async function addStudent(razred, id) {
	//console.log("addstudent()");
	if(id && razred) {
		if(!students.includes(id)) {
			await Fs.appendFile(studentspath + razred + ".txt", "\r\n" + id, async function (err) {
			  if (err) throw err;
			  await loadStudent(razred);
			});
			await sleep(1000);
		} else {
			return "Že vpisan.";
		}
	} else {
		return "Napaka: 255";
	}
}
async function removeStudent(razred, id) {
	//console.log("removestudent()");
	if(razred && id) {
		loadStudent(razred);
		if(!isNaN(id)) {
			let studetsstring = students.toString();
			if(studetsstring.includes(id)) {
				let studentindexremove = students.indexOf(id);
				students[studentindexremove] = "-";
				let novistudents = [];
				students.forEach(stut => {
					if(stut) {
						if(stut != "-") {
							novistudents.push(stut);
						}
					}
				});
				
				await Fs.writeFile(studentspath + razred + ".txt", novistudents.join("\r\n"), async function (err) {
					if (err) throw err;
					await loadStudent(razred);
				});
				await sleep(1000);
				
			} else {
				return "Ne obstaja.";
			}
		} else {
			return "Napaka: 284"
		}
	} else {
		return "Napaka: 287";
	}
}
async function checkExpiredTesti(razred) {
	//console.log("checkExpiredTesti");
	//await loadtesti(razred);
	//await sleep(500);
	testi.forEach(async tetest => {
		if(tetest) {
			let imepredmeta = tetest.split(":")[0].toString();
			let timepredmeta = Math.floor(tetest.split(":")[1]);
			let ttp = timepredmeta + 72000000;
			let zdele = new Date().getTime()
			//console.log("timepredmeta="+timepredmeta+"\tdate.gettime=" + zdele + "\tttp=" + ttp);//
			if(ttp < zdele) { //20ur kasnej in več ga šele zbriše
			console.log("timepredmetaje manjsi od timestampnow(" + zdele + ")+1d. odstranjevanje..." + imepredmeta);
				await removetest(razred, imepredmeta, timepredmeta);
				await sleep(500);
			}
		}
	});
	await sleep(500);
	//await sorttesti(razred);
}
function checkDateToTimestamp(datum) {
	if(datum) {
		if(datum.includes(".")) {
			let datumpodatki = datum.split(".");
			let dan = datumpodatki[0].toString();
			let mesec = datumpodatki[1].toString();
			let leto = datumpodatki[2].toString();
			if(!isNaN(dan) && !isNaN(mesec) && !isNaN(leto)) {
				if(dan > 0 && dan < 32) {
					if(mesec > 0 && mesec < 13) {
						if(leto > 2021 && leto < 2024) {
							let dtt = new Date(leto, mesec-1, dan);
							let dttt = dtt.getTime();
							return dttt;
						} else {
							return "Napaka leta!";
						}
					} else {
						return "Napaka meseca!";
					}
				} else {
					return "Napaka dneva!";
				}
			} else {
				return "Napaka datuma 3!";
			}
		} else {
			return "Napaka datuma 2!";
		}
	} else {
		return "Napaka datuma!";
	}
}

async function makeTestList(razred) {
	let testiMeseci = [
		[//prvo leto
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[]
		],
		[//drugo leto
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[]
		]
	
	];
	let prvoletocheck = 0;
	let drugoletocheck = 0;
	
	await sorttesti(razred);
	await sleep(500);
	let testlist = [];
	await testi.forEach(async testek => {
		if(testek) {
			let imeme = testek.split(":")[0].toString();
			let timeme = Number(testek.split(":")[1]);
			let titi = new Date(timeme);
			let day = titi.getDate();
			let month = titi.getMonth()+1;
			let year = titi.getFullYear();
			let reltime = "<t:" + Math.floor(timeme/1000) + ":R>"
			await sleep(500);
			testiMeseci[year-2022][month-1].push(imeme + ": " + day + "." + month + "." + year + "\t" + reltime);
			//console.log("testlist.push=" + imeme + ": " + day + "." + month + "." + year);
			testlist.push(imeme + ": " + day + "." + month + "." + year);
		}
	});
	
	await sleep(500);
	
	
	let testiMeseciPrvo = [];
	var i = 0;
	for(i=0;i<12;i++) {
		//if(testiMeseci[0][i].toString().includes(":")) {
			testiMeseciPrvo.push(testiMeseci[0][i]);
		//}
	}
	await sleep(500);
	
	let testiMeseciDrugo = [];
	var u = 0;
	for(u=0;u<12;u++) {
		//if(testiMeseci[1][u].toString().includes(":")) {
			testiMeseciDrugo.push(testiMeseci[1][u]);
		//}
	}
	await sleep(500);
	
	let testiMeseciTextPrvo = [];
	var p = 0;
	for(p=0;p<12;p++) {
		if(testiMeseciPrvo[p].toString().includes(":")) {
			testiMeseciTextPrvo.push("\n__" + sloMeseci(p,0) + "__");
			testiMeseciTextPrvo.push(testiMeseciPrvo[p]);
			prvoletocheck = 1;
		}
	}
	await sleep(500);
	
	let testiMeseciTextDrugo = [];
	var d = 0;
	for(d=0;d<12;d++) {
		if(testiMeseciDrugo[d].toString().includes(":")) {
			testiMeseciTextDrugo.push("\n__" + sloMeseci(d,0) + "__");
			testiMeseciTextDrugo.push(testiMeseciDrugo[d]);
			drugoletocheck = 1;
		}
	}
	await sleep(500);
	/*
	console.log("prvo leto:");
	console.log(testiMeseciPrvo);
	console.log("drugo leto:");
	console.log(testiMeseciDrugo);
	console.log("");
	console.log("testiMeseciTextPrvo:");
	console.log(testiMeseciTextPrvo);
	console.log("testiMeseciTextDrugo:");
	console.log(testiMeseciTextDrugo);
	*/
	console.log("tlmt moment");
	let testiAllOutput = "";
	if(prvoletocheck) {
		testiAllOutput += "\n**2022**:\n" + testiMeseciTextPrvo.join("\n") + "\n\n\n";
	}
	if(drugoletocheck) {
		testiAllOutput += "**2023**:\n" + testiMeseciTextDrugo.join("\n");
	}
	if(!prvoletocheck && !drugoletocheck) {
		testiAllOutput = "Ni testov.";
	}
	//console.log(testiAllOutput);
	//return testlist;
	let naslednihxdni = await getxdnitesti(razred);
	if(!naslednihxdni) naslednihxdni = "\n";
	let output = "**__Seznam testov [E4C]__**\n\n" + testiAllOutput.toString().replace(/,/g,"\n") + "\n\n\n" + naslednihxdni + "\n\n";
	return output;
}
let testichannels = [];
async function loadTestiChannels(razred) {
	let rawChannel;
	await Fs.readFile(channelspath + razred + ".txt", 'utf8', function(err, data) {
	  if (err) throw err;
	  rawChannel = data.toString().split("\r\n");
	  testichannels = [];
	  rawChannel.forEach(sutu => {
		  if(sutu) testichannels.push(sutu);
	  });
	});
}
async function updateMSG(razred) {
	//console.log("Posodabljanje za razred " + razred);
	let testlistupdate = await makeTestList(razred);
	await loadTestiChannels(razred);
	await sleep(500);
	//console.log("testichannels:");
	//console.log(testichannels);
	testichannels.forEach(tch => {
		if(tch) {
			let chId = tch.split(":")[0];
			let msgId = tch.split(":")[1];
			//console.log("updatam msg(" +msgId + ") v channelu(" + chId + ")");
			bot.channels.cache.get(chId).messages.fetch({around: msgId, limit: 1})
				.then(msg => {
					const fetchedMsg = msg.first();
					if(fetchedMsg.author.id == bot.user.id) {
						fetchedMsg.edit(testlistupdate);
					}
				});
				/*
				.catch(err => {
					console.log("napaka pri fetchanju msg z idjema=" + tch + "=" + err);
				});*/
		}
	})
}
function aJeToKostan(msg) {
	if(msg.author.id == '291620103387348994') {
		return true;
	} else {
		return false;
	}
}
function aJeToMod(msg) {
	if(students.includes(msg.author.id)) {
		return true;
	} else {
		return false;
	}
}


/////////////////////////////////////////////////
//KROKY
////////////////////////////////////////////////
async function sendKroky(razred) {
	let zdej = new Date(); //zdej čas

	//preverjanje če je biu že poslan
	let trenutnidan = zdej.getDate();
	let trenutnimesec = zdej.getMonth()+1;
	let trenutnoleto = zdej.getFullYear();
	let trenutnidatum = trenutnidan + "." + trenutnimesec + "." + trenutnoleto;
	let zadnjidatum = await Fs.readFileSync("./reminders/sent-kroky/" + razred + ".txt").toString();
	if(zadnjidatum.includes(trenutnidatum)) {
		console.log("kroky že poslan");
		return;
	}
	console.log("kroky še NI bil poslan..");


	let ajedan = false; //a je najdu sredo
	let timestamp = zdej.getTime()+86400000; //začetni timestamp, en dan naprej ker bo drgac sreda že in pol ne dela ker je prepozn
	console.log(`zdej je [${zdej}]\n to je dan[${zdej.getDay()}]\n`);

	for(let i = 0;i<=6 && !ajedan ;i++) { //1 dan = 24h*60min*60s*1000ms=86 400 000, pregleda do 7 dni da najde sredo
		//
		let tempdan = new Date(timestamp); //tempdan na določen timestamp
		//console.log(`nekdan je [${tempdan}] to je dan [${tempdan.getDay()}](more bit 3)`);
		if(tempdan.getDay() == kroky.danvtednu) { //prever če je sreda(3 v tednu) drgač pršteje 1 dan
			ajedan = true;
		} else {
			timestamp+=86400000;
		}
	}
	let sreda = new Date(timestamp); //najdena sreda

	console.log(`nasledni sreda je [${sreda}], to je dan [${sreda.getDay()}], na timest [${sreda.getTime()}]\n`);

	//razlika
	let razlikadni = Math.floor((sreda.getTime() - zdej.getTime())/86400000); //zracuna ratliko timestampov pa deli z 1 dan v ms, dobi kok dni je še (1-7)
	console.log(`razlika med zdej pa nasledno sredo je ${razlikadni} dni\n`);
	let krokychannel = await bot.channels.cache.get(kroky.channelid);
	if(razlikadni == 1) {
		//1dan
		krokychannel.send(`<@&${kroky.roles.kroky1}> Ne pozabi naročiti malce! Čas imaš do <t:${Math.floor(sreda.getTime()/1000)}:R>`);
		console.log(`<@&${kroky.roles.kroky1}> Ne pozabi naročiti malce! Čas imaš do <t:${Math.floor(sreda.getTime()/1000)}:R>`);
	} else if(razlikadni == 2) {
		//2dni 
		krokychannel.send(`<@&${kroky.roles.kroky2}> Ne pozabi naročiti malce! Čas imaš do <t:${Math.floor(sreda.getTime()/1000)}:R>`);
		console.log(`<@&${kroky.roles.kroky2}> Ne pozabi naročiti malce! Čas imaš do <t:${Math.floor(sreda.getTime()/1000)}:R>`);
	} else if(razlikadni == 3) {
		//3dni
		krokychannel.send(`<@&${kroky.roles.kroky3}> Ne pozabi naročiti malce! Čas imaš do <t:${Math.floor(sreda.getTime()/1000)}:R>`);
		console.log(`<@&${kroky.roles.kroky3}> Ne pozabi naročiti malce! Čas imaš do <t:${Math.floor(sreda.getTime()/1000)}:R>`);
	}

	await Fs.appendFile("./reminders/sent-kroky/" + razred + ".txt", trenutnidatum + "\r\n", async function (err) {
		if (err) throw err;
	});
}


function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
bot.login(settings.token);