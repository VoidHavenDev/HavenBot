const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  Events 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ]
});

// ✅ SEU CANAL DE CARTAS
const CANAL_CARTAS = '1510807765319155902';

client.once('ready', () => {
  console.log(`🔥 Bot pronto como ${client.user.tag}`);
});

// 📩 COMANDO PRA CRIAR O PAINEL
client.on('messageCreate', async (message) => {
  if (message.content === '!painel') {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('anonimo')
        .setLabel('📩 Anônimo')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('assinado')
        .setLabel('✍️ Assinado')
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({
      content: '💌 **Correio Elegante**\nClique abaixo para enviar uma carta:',
      components: [row]
    });
  }
});

// 🔘 QUANDO CLICAR NO BOTÃO
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  await interaction.reply({
    content: '✏️ Digite sua mensagem:',
    ephemeral: true
  });

  const filter = m => m.author.id === interaction.user.id;

  const collector = interaction.channel.createMessageCollector({
    filter,
    max: 1,
    time: 60000
  });

  collector.on('collect', async (msg) => {

    const canal = client.channels.cache.get(CANAL_CARTAS);

    if (!canal) {
      return msg.reply('❌ Canal de cartas não encontrado.');
    }

    let texto;

    if (interaction.customId === 'anonimo') {
      texto = `📩 **Mensagem Anônima:**\n${msg.content}`;
    } else {
      texto = `📩 **Mensagem de ${interaction.user.username}:**\n${msg.content}`;
    }

    canal.send(texto);

    msg.reply('✅ Carta enviada!');
  });
});

client.login(process.env.TOKEN);
