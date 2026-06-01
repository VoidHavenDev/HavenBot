const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CANAL_CARTAS = '1510807765319155902';

client.once('ready', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

// 📌 COMANDO !painel
client.on('messageCreate', async (message) => {
  if (message.content === '!painel') {

    const embed = new EmbedBuilder()
      .setTitle('📮 Correio Anônimo')
      .setDescription('Envie uma mensagem para alguém do servidor!\n\nClique no botão abaixo.')
      .setColor('#2b2d31')
      .setFooter({ text: 'Sistema de correio' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('abrir_painel')
        .setLabel('Enviar Carta')
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 🔘 INTERAÇÕES
client.on(Events.InteractionCreate, async interaction => {

  // clicar no botão inicial
  if (interaction.isButton() && interaction.customId === 'abrir_painel') {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('anonimo')
        .setLabel('Anônimo')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('assinado')
        .setLabel('Assinado')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({
      content: 'Como deseja enviar?',
      components: [row],
      ephemeral: true
    });
  }

  // escolher tipo
  if (interaction.isButton() && (interaction.customId === 'anonimo' || interaction.customId === 'assinado')) {

    const tipo = interaction.customId;

    const modal = new ModalBuilder()
      .setCustomId(`modal_${tipo}`)
      .setTitle('Escreva sua carta');

    const input = new TextInputBuilder()
      .setCustomId('mensagem')
      .setLabel('Sua mensagem')
      .setStyle(TextInputStyle.Paragraph);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  // enviar mensagem
  if (interaction.isModalSubmit()) {

    const msg = interaction.fields.getTextInputValue('mensagem');
    const canal = client.channels.cache.get(CANAL_CARTAS);

    const embed = new EmbedBuilder()
      .setDescription(msg)
      .setColor('#5865F2')
      .setTimestamp();

    if (interaction.customId === 'modal_anonimo') {
      embed.setAuthor({ name: '📨 Anônimo' });
    } else {
      embed.setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      });
    }

    canal.send({ embeds: [embed] });

    await interaction.reply({
      content: '✅ Carta enviada!',
      ephemeral: true
    });
  }

});

client.login(process.env.TOKEN);
