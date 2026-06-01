const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  Events 
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// ID DO CANAL ONDE VAI CHEGAR
const CANAL_CARTAS = 'https://discord.com/channels/1505653299351781376/1510808388202795008';

client.once('ready', async () => {
  console.log(`Logado como ${client.user.tag}`);
});

// COMANDO PRA ENVIAR A MENSAGEM INICIAL
client.on('messageCreate', async (message) => {
  if (message.content === '!painel') {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('anonimo')
        .setLabel('📩 Enviar Anônimo')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('assinado')
        .setLabel('✍️ Enviar Assinado')
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({
      content: `💌 **Correio Elegante**

Clique em um botão para enviar uma cartinha!`,
      components: [row]
    });
  }
});

// QUANDO CLICAR NO BOTÃO
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  await interaction.reply({
    content: '✏️ Escreva sua mensagem:',
    ephemeral: true
  });

  const filter = m => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

  collector.on('collect', async (msg) => {

    const canal = client.channels.cache.get(CANAL_CARTAS);

    let texto;

    if (interaction.customId === 'anonimo') {
      texto = `📩 **Mensagem Anônima:**\n${msg.content}`;
    } else {
      texto = `📩 **Mensagem de ${interaction.user.username}:**\n${msg.content}`;
    }

    canal.send(texto);

    msg.reply('✅ Sua carta foi enviada!');
  });
});

client.login(process.env.TOKEN);
