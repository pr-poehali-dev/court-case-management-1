import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-6 items-center justify-center px-4 z-10"
      >
        <motion.div 
          className="flex items-center gap-3 mb-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Icon name="Scale" size={32} className="text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white">
            ЮристПро
          </h1>
        </motion.div>

        <div className="text-2xl md:text-4xl font-light text-slate-700 dark:text-neutral-200 text-center max-w-3xl">
          Современная CRM-система для управления юридической практикой
        </div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button 
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 gap-2"
          >
            <Icon name="ArrowRight" size={20} />
            Войти в систему
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-900/80 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg transition-all duration-300 gap-2"
          >
            <Icon name="Info" size={20} />
            Узнать больше
          </Button>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <Icon name="Briefcase" size={24} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Управление делами</h3>
            <p className="text-slate-600 dark:text-slate-400">Контроль всех дел и клиентов в одном месте</p>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <Icon name="Calendar" size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Календарь заседаний</h3>
            <p className="text-slate-600 dark:text-slate-400">Никогда не пропустите важное заседание</p>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <Icon name="Wallet" size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Финансовая аналитика</h3>
            <p className="text-slate-600 dark:text-slate-400">Полный контроль бюджетов и расходов</p>
          </div>
        </motion.div>
      </motion.div>
    </AuroraBackground>
  );
};

export default Landing;
