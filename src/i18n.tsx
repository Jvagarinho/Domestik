import React, { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  en: {
    'app.loading': 'Initializing Domestik...',
    'app.welcomePrefix': 'Welcome back,',
    'nav.overview': 'Overview',
    'nav.clients': 'Clients',
    'viewOnly.title': 'View-Only Mode',
    'viewOnly.description': 'Your account is being reviewed for admin privileges.',
    'dashboard.addNewClient': 'Add New Client',
    'dashboard.monthlyEarnings': 'MONTHLY EARNINGS',
    'dashboard.totalHours': 'TOTAL HOURS',
    'dashboard.services': 'SERVICES',
    'fab.registerNewDay': 'Register New Day',
    'clients.title': 'Clients',
    'clients.subtitle': 'Totals for the selected month',
    'clients.addButton': '+ Add Client',
    'clients.stats.servicesSuffix': 'services',
    'clients.stats.hoursSuffix': 'h this month',
    'clients.empty': 'No clients yet. Add your first client to get started.',
    'clients.archivePrefix': 'Archive',
    'clients.archiveButton': 'Archive',
    'clients.editButton': 'Edit',
    'modal.service.editTitle': 'Edit Service',
    'modal.service.newTitle': 'Register New Day',
    'modal.client.editTitle': 'Edit Client',
    'modal.client.newTitle': 'Add New Client',
    'config.missingTitle': 'Configuration Missing',
    'config.missingBody':
      'The application is missing Supabase credentials. This usually means the .env file is missing or empty.',
    'config.missingFooter': 'Please verify your setup.',
    'login.title': 'Welcome Back',
    'signup.title': 'Create Account',
    'login.subtitle': 'Enter your credentials to continue',
    'signup.subtitle': 'Join Domestik to start managing your business',
    'login.emailLabel': 'Email Address',
    'login.emailPlaceholder': 'you@example.com',
    'login.passwordLabel': 'Password',
    'login.processing': 'Processing...',
    'login.signIn': 'Sign In',
    'login.signUp': 'Sign Up',
    'login.noAccount': "Don't have an account?",
    'login.haveAccount': 'Already have an account?',
    'login.createOne': 'Create one now',
    'login.signInInstead': 'Sign in instead',
    'login.signupSuccess': 'Registration successful! Please sign in.',
    'clientForm.nameLabel': 'Client Name',
    'clientForm.namePlaceholder': 'e.g. Maria Silva',
    'clientForm.colorLabel': 'Identify with Color',
    'clientForm.saveChanges': 'Save Changes',
    'clientForm.addClient': 'Add Client',
    'serviceForm.selectClientAlert': 'Please select a client',
    'serviceForm.dateLabel': 'Date',
    'serviceForm.clientLabel': 'Client',
    'serviceForm.clientPlaceholder': 'Select a client',
    'serviceForm.hoursLabel': 'Hours',
    'serviceForm.rateLabel': 'Rate ($/hr)',
    'serviceForm.totalLabel': 'Total for the Day',
    'serviceForm.save': 'Save Service',
    'history.title': 'History',
    'history.allClients': 'All Clients',
    'history.empty': 'Ready to start the day?',
    'history.confirmDelete': 'Are you sure you want to delete this entry?',
    'history.filters': 'Filters',
    'history.filterClient': 'Client',
    'history.fromDate': 'From',
    'history.toDate': 'To',
    'history.minValue': 'Min Value',
    'history.maxValue': 'Max Value',
    'history.sortBy': 'Sort By',
    'history.sortDate': 'Date',
    'history.sortValue': 'Value',
    'history.sortClient': 'Client Name',
    'history.order': 'Order',
    'history.ascending': 'Ascending',
    'history.descending': 'Descending',
    'history.clearFilters': 'Clear All Filters',
    'month.prev': 'Previous Month',
    'month.next': 'Next Month',
    'header.signOut': 'Sign Out',
    'toast.clientAdded': 'Client added successfully',
    'toast.clientUpdated': 'Client updated successfully',
    'toast.clientArchived': 'Client archived successfully',
    'toast.serviceAdded': 'Service added successfully',
    'toast.serviceUpdated': 'Service updated successfully',
    'toast.serviceDeleted': 'Service deleted successfully',
    'toast.error': 'An error occurred. Please try again.',
    'confirmModal.cancel': 'Cancel',
    'confirmModal.confirm': 'Confirm'
  },
  pt: {
    'app.loading': 'Iniciando o Domestik...',
    'app.welcomePrefix': 'Bem-vindo(a),',
    'nav.overview': 'Visão geral',
    'nav.clients': 'Clientes',
    'viewOnly.title': 'Modo somente leitura',
    'viewOnly.description': 'Sua conta está sendo analisada para privilégios de administrador.',
    'dashboard.addNewClient': 'Adicionar cliente',
    'dashboard.monthlyEarnings': 'TOTAL MENSAL',
    'dashboard.totalHours': 'HORAS TOTAIS',
    'dashboard.services': 'SERVIÇOS',
    'fab.registerNewDay': 'Registrar novo dia',
    'clients.title': 'Clientes',
    'clients.subtitle': 'Totais do mês selecionado',
    'clients.addButton': '+ Adicionar cliente',
    'clients.stats.servicesSuffix': 'serviços',
    'clients.stats.hoursSuffix': 'h neste mês',
    'clients.empty': 'Nenhum cliente ainda. Adicione o primeiro para começar.',
    'clients.archivePrefix': 'Arquivar',
    'modal.service.editTitle': 'Editar serviço',
    'modal.service.newTitle': 'Registrar novo dia',
    'modal.client.editTitle': 'Editar cliente',
    'modal.client.newTitle': 'Adicionar novo cliente',
    'config.missingTitle': 'Configuração ausente',
    'config.missingBody':
      'O aplicativo está sem as credenciais do Supabase. Normalmente isso significa que o arquivo .env está ausente ou incompleto.',
    'config.missingFooter': 'Verifique sua configuração.',
    'login.title': 'Bem-vindo de volta',
    'signup.title': 'Criar conta',
    'login.subtitle': 'Informe suas credenciais para continuar',
    'signup.subtitle': 'Use o Domestik para organizar o seu trabalho',
    'login.emailLabel': 'Endereço de e-mail',
    'login.emailPlaceholder': 'voce@exemplo.com',
    'login.passwordLabel': 'Senha',
    'login.processing': 'Processando...',
    'login.signIn': 'Entrar',
    'login.signUp': 'Cadastrar',
    'login.noAccount': 'Ainda não tem uma conta?',
    'login.haveAccount': 'Já tem uma conta?',
    'login.createOne': 'Criar agora',
    'login.signInInstead': 'Entrar em vez disso',
    'login.signupSuccess': 'Cadastro realizado com sucesso! Faça login.',
    'clientForm.nameLabel': 'Nome do cliente',
    'clientForm.namePlaceholder': 'ex.: Maria Silva',
    'clientForm.colorLabel': 'Identificar com cor',
    'clientForm.saveChanges': 'Salvar alterações',
    'clientForm.addClient': 'Adicionar cliente',
    'serviceForm.selectClientAlert': 'Selecione um cliente',
    'serviceForm.dateLabel': 'Data',
    'serviceForm.clientLabel': 'Cliente',
    'serviceForm.clientPlaceholder': 'Selecione um cliente',
    'serviceForm.hoursLabel': 'Horas',
    'serviceForm.rateLabel': 'Valor (€/h)',
    'serviceForm.totalLabel': 'Total do dia',
    'serviceForm.save': 'Salvar serviço',
    'history.title': 'Histórico',
    'history.allClients': 'Todos os clientes',
    'history.empty': 'Pronto para começar o dia?',
    'history.confirmDelete': 'Tem certeza de que deseja excluir este registro?',
    'history.filters': 'Filtros',
    'history.filterClient': 'Cliente',
    'history.fromDate': 'De',
    'history.toDate': 'Até',
    'history.minValue': 'Valor Mín.',
    'history.maxValue': 'Valor Máx.',
    'history.sortBy': 'Ordenar Por',
    'history.sortDate': 'Data',
    'history.sortValue': 'Valor',
    'history.sortClient': 'Nome do Cliente',
    'history.order': 'Ordem',
    'history.ascending': 'Crescente',
    'history.descending': 'Decrescente',
    'history.clearFilters': 'Limpar Filtros',
    'clients.archiveButton': 'Arquivar', 
    'clients.editButton': 'Editar',
    'month.prev': 'Mês anterior',
    'month.next': 'Próximo mês',
    'header.signOut': 'Sair',
    'toast.clientAdded': 'Cliente adicionado com sucesso',
    'toast.clientUpdated': 'Cliente atualizado com sucesso',
    'toast.clientArchived': 'Cliente arquivado com sucesso',
    'toast.serviceAdded': 'Serviço adicionado com sucesso',
    'toast.serviceUpdated': 'Serviço atualizado com sucesso',
    'toast.serviceDeleted': 'Serviço eliminado com sucesso',
    'toast.error': 'Ocorreu um erro. Tente novamente.',
    'confirmModal.cancel': 'Cancelar',
    'confirmModal.confirm': 'Confirmar'
  }
} as const;

type Language = 'en' | 'pt';
type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('domestik_lang');
    if (stored === 'en' || stored === 'pt') {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('domestik_lang', lang);
    }
  };

  const t = (key: TranslationKey) => {
    const table = translations[language];
    return table[key] ?? translations.en[key];
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
