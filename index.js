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
  Events,
  UserSelectMenuBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CANAL_CARTAS = '1510807765319155902';
const CANAL_LOG = '1510823224022401175';

client.once('ready', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

// 📌 painel bonito
client.on('messageCreate', async (message) => {
  if (message.content === '!painel') {

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📮 Correio Elegante')
      .setDescription('Envie uma carta anônima ou assinada para alguém do servidor.\n\nClique no botão abaixo 💜')
      .setImage('https://i.imgur.com/8Km9tLL.png') // 👉 pode trocar depois
      .setFooter({ text: 'Sistema de Correio • Seja respeitoso' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('abrir_painel')
        .setLabel('💌 Enviar Carta')
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

// 🔘 interações
client.on(Events.InteractionCreate, async interaction => {

  // abrir painel
  if (interaction.isButton() && interaction.customId === 'abrir_painel') {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('anonimo')
        .setLabel('👻 Anônimo')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('assinado')
        .setLabel('✍️ Assinado')
        .setStyle(ButtonStyle.Success)
    );

    return interaction.reply({
      content: '📨 Como deseja enviar sua carta?',
      components: [row],
      ephemeral: true
    });
  }

  // escolher tipo
  if (interaction.isButton() && (interaction.customId === 'anonimo' || interaction.customId === 'assinado')) {

    const tipo = interaction.customId;

    const select = new UserSelectMenuBuilder()
      .setCustomId(`select_${tipo}`)
      .setPlaceholder('🔍 Buscar destinatário...');

    const row = new ActionRowBuilder().addComponents(select);

    return interaction.update({
      content: '👤 Escolha quem vai receber:',
      components: [row]
    });
  }

  // selecionar usuário
  if (interaction.isUserSelectMenu()) {

    const tipo = interaction.customId.split('_')[1];
    const userId = interaction.values[0];

    const modal = new ModalBuilder()
      .setCustomId(`modal_${tipo}_${userId}`)
      .setTitle('💌 Escreva sua carta');

    const input = new TextInputBuilder()
      .setCustomId('mensagem')
      .setLabel('Digite sua mensagem')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(input)
    );

    return interaction.showModal(modal);
  }

  // envio final
  if (interaction.isModalSubmit()) {

    const [_, tipo, userId] = interaction.customId.split('_');
    const msg = interaction.fields.getTextInputValue('mensagem');

    const canal = client.channels.cache.get(CANAL_CARTAS);
    const log = client.channels.cache.get(CANAL_LOG);

    const user = await client.users.fetch(userId);

    // 💎 EMBED ABSURDA
    const embed = new EmbedBuilder()
      .setColor(tipo === 'anonimo' ? '#111214' : '#5865F2')

      .setAuthor({
        name: tipo === 'anonimo' ? '👻 Remetente Anônimo' : interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      })

      .setTitle('💌 Nova Carta Recebida')

      .setDescription(`━━━━━━━━━━━━━━━\n💬 ${msg}\n━━━━━━━━━━━━━━━`)

      .addFields(
        {
          name: '📬 Destinatário',
          value: `<@${user.id}>`,
          inline: true
        },
        {
          name: '📨 Tipo',
          value: tipo === 'anonimo' ? 'Anônima 👻' : 'Assinada ✍️',
          inline: true
        }
      )

      .setThumbnail(user.displayAvatarURL({ dynamic: true }))

      .setImage('https://i.imgur.com/Z6XbK9K.png') // 👉 banner bonito

      .setFooter({
        text: 'Correio Elegante • Entregue com sucesso 💜'
      })

      .setTimestamp();

    // envia carta
    canal.send({
      content: `📬 <@${user.id}> você recebeu uma carta!`,
      embeds: [embed]
    });

    // 📜 LOG
    if (log) {
      const logEmbed = new EmbedBuilder()
        .setTitle('📜 Nova carta enviada')
        .addFields(
          { name: 'De', value: interaction.user.tag },
          { name: 'Para', value: `<@${user.id}>` },
          { name: 'Tipo', value: tipo },
          { name: 'Mensagem', value: msg }
        )
        .setColor('#ED4245')
        .setTimestamp();

      log.send({ embeds: [logEmbed] });
    }

    return interaction.reply({
      content: '✅ Carta enviada com sucesso!',
      ephemeral: true
    });
  }

});

client.login(process.env.TOKEN);
