/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Wrench,
  Plus,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  MessageSquare,
  Bot,
  Send,
  FileText,
  Grid,
  List,
  Key,
  ArrowRight,
  ChevronDown,
  Film,
  Layers,
  Monitor,
  Images,
  SlidersHorizontal,
  Sparkles,
  Type,
  Tv,
  RefreshCw
} from 'lucide-react';

const defaultProps = {
  strokeWidth: 1.5,
};

export const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Calendar {...defaultProps} {...props} />;
export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Clock {...defaultProps} {...props} />;
export const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <MapPin {...defaultProps} {...props} />;
export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <User {...defaultProps} {...props} />;
export const WrenchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Wrench {...defaultProps} {...props} />;
export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Plus {...defaultProps} {...props} />;
export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Search {...defaultProps} {...props} />;
export const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Bell {...defaultProps} {...props} />;
export const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChevronLeft {...defaultProps} {...props} />;
export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChevronRight {...defaultProps} {...props} />;
export const MoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <MoreHorizontal {...defaultProps} {...props} />;
export const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <X {...defaultProps} {...props} />;
export const MessageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <MessageSquare {...defaultProps} {...props} />;
export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Bot {...defaultProps} {...props} />;
export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Send {...defaultProps} {...props} />;
export const FileTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FileText {...defaultProps} {...props} />;
export const GridIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Grid {...defaultProps} {...props} />;
export const ListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <List {...defaultProps} {...props} />;

// New icons for Veo and AI features
export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Key {...defaultProps} {...props} />;
export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ArrowRight {...defaultProps} {...props} />;
export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChevronDown {...defaultProps} {...props} />;
export const FilmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Film {...defaultProps} {...props} />;
export const FramesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Layers {...defaultProps} {...props} />;
export const RectangleStackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Monitor {...defaultProps} {...props} />;
export const ReferencesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Images {...defaultProps} {...props} />;
export const SlidersHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SlidersHorizontal {...defaultProps} {...props} />;
export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Sparkles {...defaultProps} {...props} />;
export const TextModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Type {...defaultProps} {...props} />;
export const TvIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Tv {...defaultProps} {...props} />;
export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <X {...defaultProps} {...props} />;
export const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <RefreshCw {...defaultProps} {...props} />;
